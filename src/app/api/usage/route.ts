import { NextRequest, NextResponse } from "next/server";

const COINPAY_API_URL = process.env.COINPAYPORTAL_API_URL || "https://api.coinpayportal.com";
const COINPAY_API_KEY = process.env.COINPAYPORTAL_API_KEY;
const COINPAY_BUSINESS_ID = process.env.COINPAYPORTAL_BUSINESS_ID;

/* ─── Demo data fallback ─── */
function generateDemoData() {
  const now = new Date();
  const history: Array<{
    id: string;
    timestamp: string;
    module: string;
    action: string;
    cost_usd: number;
    status: string;
  }> = [];

  const modules = [
    { module: "code-scanner", action: "ai.inference", costRange: [0.002, 0.005] },
    { module: "pentest-engine", action: "ai.classification", costRange: [0.01, 0.02] },
    { module: "alert-system", action: "ai.summarize", costRange: [0.002, 0.004] },
    { module: "network-monitor", action: "ai.anomaly", costRange: [0.003, 0.006] },
  ];

  // Generate 30 days of history
  for (let d = 0; d < 30; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    const eventsPerDay = Math.floor(Math.random() * 25) + 10;

    for (let e = 0; e < eventsPerDay; e++) {
      const mod = modules[Math.floor(Math.random() * modules.length)];
      const cost = +(mod.costRange[0] + Math.random() * (mod.costRange[1] - mod.costRange[0])).toFixed(4);
      const ts = new Date(day);
      ts.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

      history.push({
        id: `evt_${d}_${e}`,
        timestamp: ts.toISOString(),
        module: mod.module,
        action: mod.action,
        cost_usd: cost,
        status: "completed",
      });
    }
  }

  history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const todayEvents = history.filter((h) => h.timestamp.startsWith(todayStr));
  const weekEvents = history.filter((h) => new Date(h.timestamp) >= weekAgo);
  const monthEvents = history.filter((h) => new Date(h.timestamp) >= monthAgo);

  const todayUsd = +todayEvents.reduce((s, e) => s + e.cost_usd, 0).toFixed(2);
  const weekUsd = +weekEvents.reduce((s, e) => s + e.cost_usd, 0).toFixed(2);
  const monthUsd = +monthEvents.reduce((s, e) => s + e.cost_usd, 0).toFixed(2);
  const balanceUsd = 24.99;
  const burnRateDaily = +(monthUsd / 30).toFixed(2);
  const estimatedDaysRemaining = burnRateDaily > 0 ? Math.floor(balanceUsd / burnRateDaily) : 999;
  const projectedMonthlyUsd = +(burnRateDaily * 30).toFixed(2);

  // Daily breakdown for chart
  const dailySpend: Array<{ date: string; amount: number; requests: number }> = [];
  for (let d = 29; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    const dateStr = day.toISOString().slice(0, 10);
    const dayEvents = history.filter((h) => h.timestamp.startsWith(dateStr));
    dailySpend.push({
      date: dateStr,
      amount: +dayEvents.reduce((s, e) => s + e.cost_usd, 0).toFixed(2),
      requests: dayEvents.length,
    });
  }

  // Module breakdown
  const moduleMap = new Map<string, { module: string; action: string; requests: number; cost: number }>();
  for (const evt of monthEvents) {
    const key = `${evt.module}|${evt.action}`;
    const existing = moduleMap.get(key) || { module: evt.module, action: evt.action, requests: 0, cost: 0 };
    existing.requests += 1;
    existing.cost += evt.cost_usd;
    moduleMap.set(key, existing);
  }
  const moduleBreakdown = Array.from(moduleMap.values())
    .map((m) => ({
      ...m,
      cost: +m.cost.toFixed(2),
      percentage: +((m.cost / monthUsd) * 100).toFixed(0),
    }))
    .sort((a, b) => b.cost - a.cost);

  return {
    balance_usd: balanceUsd,
    today_usd: todayUsd,
    today_requests: todayEvents.length,
    week_usd: weekUsd,
    week_requests: weekEvents.length,
    month_usd: monthUsd,
    month_requests: monthEvents.length,
    burn_rate_daily: burnRateDaily,
    estimated_days_remaining: estimatedDaysRemaining,
    projected_monthly_usd: projectedMonthlyUsd,
    daily_spend: dailySpend,
    module_breakdown: moduleBreakdown,
    history: history.slice(0, 20),
    demo: true,
  };
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    // If no CoinPayPortal key, return demo data
    if (!COINPAY_API_KEY || !COINPAY_BUSINESS_ID) {
      return NextResponse.json(generateDemoData());
    }

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${COINPAY_API_KEY}`,
      "Content-Type": "application/json",
    };

    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Fetch balance and history in parallel
    const [creditsRes, historyRes] = await Promise.all([
      fetch(`${COINPAY_API_URL}/api/businesses/${COINPAY_BUSINESS_ID}/usage/credits?email=${encodeURIComponent(email)}`, { headers }),
      fetch(`${COINPAY_API_URL}/api/businesses/${COINPAY_BUSINESS_ID}/usage/history?email=${encodeURIComponent(email)}&from=${monthAgo.toISOString()}&to=${now.toISOString()}`, { headers }),
    ]);

    if (!creditsRes.ok || !historyRes.ok) {
      console.error("[usage] API error", creditsRes.status, historyRes.status);
      return NextResponse.json(generateDemoData());
    }

    const credits = await creditsRes.json();
    const historyData = await historyRes.json();

    const balanceUsd = credits.balance_usd || 0;
    const history = historyData.events || historyData.history || [];

    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayEvents = history.filter((h: { timestamp: string }) => h.timestamp?.startsWith(todayStr));
    const weekEvents = history.filter((h: { timestamp: string }) => new Date(h.timestamp) >= weekAgo);

    const sum = (events: Array<{ cost_usd: number }>) => +events.reduce((s: number, e: { cost_usd: number }) => s + (e.cost_usd || 0), 0).toFixed(2);

    const todayUsd = sum(todayEvents);
    const weekUsd = sum(weekEvents);
    const monthUsd = sum(history);
    const burnRateDaily = +(monthUsd / 30).toFixed(2);

    return NextResponse.json({
      balance_usd: balanceUsd,
      today_usd: todayUsd,
      today_requests: todayEvents.length,
      week_usd: weekUsd,
      week_requests: weekEvents.length,
      month_usd: monthUsd,
      month_requests: history.length,
      burn_rate_daily: burnRateDaily,
      estimated_days_remaining: burnRateDaily > 0 ? Math.floor(balanceUsd / burnRateDaily) : 999,
      projected_monthly_usd: +(burnRateDaily * 30).toFixed(2),
      daily_spend: [],
      module_breakdown: [],
      history: history.slice(0, 20),
      demo: false,
    });
  } catch (error) {
    console.error("[usage] Error:", error);
    return NextResponse.json(generateDemoData());
  }
}
