import { NextRequest, NextResponse } from 'next/server';
import { getCoinpayPaymentStatus } from '@/lib/coinpay-client';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('payment_id');
  if (!paymentId) {
    return NextResponse.json({ error: 'payment_id required' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    supabase = null;
  }

  if (supabase) {
    const { data } = await supabase
      .from('funding_payments')
      .select('status, tx_hash, updated_at')
      .eq('coinpay_payment_id', paymentId)
      .maybeSingle();
    if (data && ['forwarded', 'failed', 'expired'].includes(data.status as string)) {
      return NextResponse.json(data);
    }
  }

  const live = await getCoinpayPaymentStatus(paymentId);

  if (supabase && live.status) {
    await supabase
      .from('funding_payments')
      .update({
        status: live.status,
        tx_hash: live.tx_hash ?? null,
        updated_at: new Date().toISOString(),
        ...(live.status === 'forwarded' || live.status === 'confirmed'
          ? { paid_at: new Date().toISOString() }
          : {}),
      })
      .eq('coinpay_payment_id', paymentId);
  }

  return NextResponse.json({ status: live.status, tx_hash: live.tx_hash });
}
