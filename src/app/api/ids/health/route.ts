import { NextResponse } from "next/server";

const IDS_BASE = process.env.IDS_API_URL ?? "http://112.137.129.232:8765";

export async function GET() {
  try {
    const res = await fetch(`${IDS_BASE}/health`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { status: "offline", suricata: "unreachable", alerts_total: 0 },
      { status: 503 }
    );
  }
}
