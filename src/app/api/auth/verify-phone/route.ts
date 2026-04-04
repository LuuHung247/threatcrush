import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, user_id } = await req.json();

    if (!phone || !code || !user_id) {
      return NextResponse.json({ error: "Phone, code, and user_id are required" }, { status: 400 });
    }

    // STUB: Accept any 6-digit code for now
    // TODO: Real SMS verification via Twilio
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code. Must be 6 digits." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("user_profiles")
      .update({ phone_verified: true, updated_at: new Date().toISOString() })
      .eq("id", user_id);

    if (error) {
      return NextResponse.json({ error: "Failed to verify phone: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("Phone verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
