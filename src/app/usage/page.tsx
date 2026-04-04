import type { Metadata } from "next";
import UsageContent from "./usage-content";

export const metadata: Metadata = {
  title: "Usage & Billing — ThreatCrush",
  description: "Monitor your AI usage credits, spending, and billing for ThreatCrush modules.",
};

export default function UsagePage() {
  return <UsageContent />;
}
