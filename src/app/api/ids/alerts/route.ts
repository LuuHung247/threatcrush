import { NextRequest, NextResponse } from "next/server";

const IDS_BASE = process.env.IDS_API_URL ?? "http://112.137.129.232:8765";

export async function GET(req: NextRequest) {
  const last = req.nextUrl.searchParams.get("last");
  const url = last ? `${IDS_BASE}/alerts?last=${last}` : `${IDS_BASE}/alerts`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json([], { status: 503 });
  }
}
