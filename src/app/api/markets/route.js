import { NextResponse } from 'next/server';
import { fetchTopMarkets } from '@/lib/polymarket';

export async function GET() {
  try {
    const markets = await fetchTopMarkets(200);
    return NextResponse.json({ markets });
  } catch (err) {
    return NextResponse.json({ markets: [], error: 'Live data unavailable.' }, { status: 200 });
  }
}
