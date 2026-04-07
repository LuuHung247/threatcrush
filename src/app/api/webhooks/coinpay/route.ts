import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyCoinpayWebhook, type CoinpayWebhookPayload } from '@/lib/coinpay-client';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

/**
 * Unified CoinPay webhook handler.
 *
 * - HMAC-signed funding payments (from /api/funding/create-invoice) are
 *   verified and update funding_payments.
 * - Legacy/unsigned waitlist payments fall through and update waitlist.
 *
 * CoinPay only allows one webhook URL per business, so this single
 * route dispatches based on which table contains the payment id.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-coinpay-signature');
  const secret = process.env.COINPAY_WEBHOOK_SECRET;
  const signatureValid =
    !!signature && !!secret && verifyCoinpayWebhook(rawBody, signature, secret);

  let payload: CoinpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as CoinpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  console.log('[coinpay webhook] received', {
    type: payload.type,
    signed: signatureValid,
  });

  const data = payload.data || ({} as CoinpayWebhookPayload['data']);
  const eventType = payload.type || (payload as { event?: string }).event || '';
  const paymentId =
    data.payment_id || (data as { id?: string }).id || (payload as { id?: string }).id;

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment_id' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch (e) {
    console.error('[coinpay webhook] no supabase:', e);
    return NextResponse.json({ received: true, persisted: false });
  }

  // Check funding first.
  const { data: fundingRow } = await supabase
    .from('funding_payments')
    .select('id')
    .eq('coinpay_payment_id', paymentId)
    .maybeSingle();

  if (fundingRow) {
    if (!signatureValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const now = new Date().toISOString();
    const amountCrypto =
      typeof data.amount_crypto === 'string'
        ? parseFloat(data.amount_crypto)
        : (data.amount_crypto ?? null);

    let nextStatus: string | null = null;
    switch (eventType) {
      case 'payment.confirmed':
        nextStatus = 'confirmed';
        break;
      case 'payment.forwarded':
        nextStatus = 'forwarded';
        break;
      case 'payment.expired':
        nextStatus = 'expired';
        break;
      case 'payment.failed':
        nextStatus = 'failed';
        break;
      default:
        return NextResponse.json({ received: true, ignored: eventType });
    }

    const update: Record<string, unknown> = {
      status: nextStatus,
      updated_at: now,
      tx_hash: data.tx_hash ?? null,
    };
    if (amountCrypto !== null) update.amount_crypto = amountCrypto;
    if (nextStatus === 'confirmed' || nextStatus === 'forwarded') update.paid_at = now;

    const { error } = await supabase
      .from('funding_payments')
      .update(update)
      .eq('coinpay_payment_id', paymentId);

    if (error) {
      console.error('[coinpay webhook] funding update failed:', error);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }
    return NextResponse.json({ received: true });
  }

  // Fall back to waitlist (legacy unsigned path).
  const status = data.status;
  if (
    !['payment.confirmed', 'payment.forwarded'].includes(eventType) &&
    !['confirmed', 'forwarded'].includes(status as string)
  ) {
    console.log(`[coinpay webhook] Ignoring waitlist event: ${eventType} / ${status}`);
    return NextResponse.json({ ok: true });
  }

  const { data: entry } = await supabase
    .from('waitlist')
    .select('id, email, paid')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (!entry) {
    console.warn(`[coinpay webhook] No funding or waitlist row for ${paymentId}`);
    return NextResponse.json({ ok: true });
  }

  if (entry.paid) {
    return NextResponse.json({ ok: true });
  }

  await supabase
    .from('waitlist')
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
      payment_status: 'confirmed',
    })
    .eq('id', entry.id);

  const { data: fullEntry } = await supabase
    .from('waitlist')
    .select('referred_by')
    .eq('id', entry.id)
    .single();

  if (fullEntry?.referred_by) {
    await supabase
      .from('waitlist')
      .update({ amount_usd: 399 })
      .eq('referral_code', fullEntry.referred_by)
      .eq('paid', false);
  }

  return NextResponse.json({ ok: true, email: entry.email });
}
