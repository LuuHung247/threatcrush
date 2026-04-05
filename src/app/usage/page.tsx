import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import UsageContent from "./usage-content";

export const metadata: Metadata = {
  title: "Usage & Billing — ThreatCrush",
  description: "Monitor your AI usage credits, spending, and billing for ThreatCrush modules.",
};

async function requireUsageAccess() {
  const supabase = getSupabaseAdmin();

  // Read the Supabase auth token cookie directly.
  // This is intentionally simple for now and mirrors the app's current auth shape.
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const possibleCookies = [
    cookieStore.get("sb-access-token")?.value,
    cookieStore.get("supabase-auth-token")?.value,
  ].filter(Boolean) as string[];

  for (const token of possibleCookies) {
    const { data } = await supabase.auth.getUser(token);
    if (data?.user) {
      return data.user;
    }
  }

  redirect("/auth/login?next=/usage");
}

export default async function UsagePage() {
  await requireUsageAccess();
  return <UsageContent />;
}
