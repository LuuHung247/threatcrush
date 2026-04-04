import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to control env vars per test
const originalEnv = { ...process.env };

import { GET } from "@/app/api/usage/route";

function makeRequest(email?: string) {
  const url = email
    ? `http://localhost/api/usage?email=${encodeURIComponent(email)}`
    : "http://localhost/api/usage";
  const req = new Request(url);
  // NextRequest needs nextUrl with searchParams
  const parsedUrl = new URL(url);
  (req as unknown as Record<string, unknown>).nextUrl = parsedUrl;
  return req as unknown as import("next/server").NextRequest;
}

describe("GET /api/usage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure no API keys set (demo mode)
    delete process.env.COINPAYPORTAL_API_KEY;
    delete process.env.COINPAYPORTAL_BUSINESS_ID;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns demo data when no API key configured", async () => {
    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.demo).toBe(true);
    expect(body.balance_usd).toBeDefined();
    expect(typeof body.balance_usd).toBe("number");
    expect(body.today_usd).toBeDefined();
    expect(body.week_usd).toBeDefined();
    expect(body.month_usd).toBeDefined();
    expect(body.burn_rate_daily).toBeDefined();
    expect(body.estimated_days_remaining).toBeDefined();
    expect(body.projected_monthly_usd).toBeDefined();
  });

  it("demo data includes daily_spend array", async () => {
    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(Array.isArray(body.daily_spend)).toBe(true);
    expect(body.daily_spend.length).toBe(30);
    expect(body.daily_spend[0]).toHaveProperty("date");
    expect(body.daily_spend[0]).toHaveProperty("amount");
    expect(body.daily_spend[0]).toHaveProperty("requests");
  });

  it("demo data includes module_breakdown", async () => {
    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(Array.isArray(body.module_breakdown)).toBe(true);
    if (body.module_breakdown.length > 0) {
      expect(body.module_breakdown[0]).toHaveProperty("module");
      expect(body.module_breakdown[0]).toHaveProperty("cost");
      expect(body.module_breakdown[0]).toHaveProperty("requests");
    }
  });

  it("demo data includes history", async () => {
    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(Array.isArray(body.history)).toBe(true);
    expect(body.history.length).toBeLessThanOrEqual(20);
  });

  it("balance is a reasonable positive number in demo mode", async () => {
    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(body.balance_usd).toBe(24.99);
  });
});
