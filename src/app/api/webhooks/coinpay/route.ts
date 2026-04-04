import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[webhook] CoinPay event:", JSON.stringify(body, null, 2));

    const eventType = body.type || body.event;
    const data = body.data || body;
    const paymentId = data.payment_id || data.id;
    const status = data.status;

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
    }

    // Only process confirmed/forwarded payments
    if (!["payment.confirmed", "payment.forwarded"].includes(eventType) && 
        !["confirmed", "forwarded"].includes(status)) {
      console.log(`[webhook] Ignoring event: ${eventType} / status: ${status}`);
      return NextResponse.json({ ok: true });
    }

    const supabase = getSupabase();

    // Find waitlist entry by payment_id
    const { data: entry, error } = await supabase
      .from("waitlist")
      .select("id, email, paid")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (error || !entry) {
      console.warn(`[webhook] No waitlist entry for payment ${paymentId}`);
      return NextResponse.json({ ok: true });
    }

    if (entry.paid) {
      console.log(`[webhook] Already paid: ${entry.email}`);
      return NextResponse.json({ ok: true });
    }

    // Mark as paid
    await supabase
      .from("waitlist")
      .update({
        paid: true,
        paid_at: new Date().toISOString(),
        payment_status: "confirmed",
      })
      .eq("id", entry.id);

    console.log(`[webhook] Payment confirmed for ${entry.email}`);

    // If this user was referred, update the referrer's price to $249 too
    const { data: fullEntry } = await supabase
      .from("waitlist")
      .select("referred_by")
      .eq("id", entry.id)
      .single();

    if (fullEntry?.referred_by) {
      await supabase
        .from("waitlist")
        .update({ amount_usd: 249 })
        .eq("referral_code", fullEntry.referred_by)
        .eq("paid", false);

      console.log(`[webhook] Referrer ${fullEntry.referred_by} gets discounted price`);
    }

    return NextResponse.json({ ok: true, email: entry.email });
  } catch (err) {
    console.error("[webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
