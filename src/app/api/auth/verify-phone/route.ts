import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
    }

    // Development stub: accepts any 6-digit code until a real SMS provider is wired in.
    // Not suitable for production verification.
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code. Must be 6 digits." }, { status: 400 });
    }

    // Resolve the user from the Bearer token — never trust a user_id from the client.
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const anon = getSupabaseClient();
    const { data: { user } } = await anon.auth.getUser(token);
    if (!user?.id) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("user_profiles")
      .update({ phone, phone_verified: true, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to verify phone: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("Phone verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
