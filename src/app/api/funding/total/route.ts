import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Public funding total. Sums confirmed/forwarded payments from our
 * funding_payments table (populated by the CoinPay webhook).
 */
export async function GET() {
  let total = 0;
  let contributors = 0;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('funding_payments')
      .select('amount_usd')
      .in('status', ['confirmed', 'forwarded']);
    if (data) {
      contributors = data.length;
      total = data.reduce((sum, row) => sum + Number(row.amount_usd ?? 0), 0);
    }
  } catch (e) {
    console.error('[funding/total] supabase error:', e);
  }

  return NextResponse.json(
    {
      total_usd: Math.round(total * 100) / 100,
      contributors,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
