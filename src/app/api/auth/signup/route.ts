import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { email, phone, password, display_name, referral_code } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Generate unique referral code
    let userReferralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("referral_code", userReferralCode)
        .single();
      if (!existing) break;
      userReferralCode = generateReferralCode();
      attempts++;
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: userId,
      email,
      phone: phone || null,
      display_name: display_name || null,
      referral_code: userReferralCode,
      referred_by: referral_code || null,
      email_verified: false,
      phone_verified: false,
    });

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Failed to create profile: " + profileError.message }, { status: 500 });
    }

    // Send verification email (Supabase handles this via their built-in flow)
    // The user needs to use signInWithPassword then verify via email link

    return NextResponse.json({
      user: { id: userId, email },
      referral_code: userReferralCode,
      needs_email_verification: true,
      needs_phone_verification: !!phone,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
