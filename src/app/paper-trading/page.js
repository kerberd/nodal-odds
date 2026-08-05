'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

const STARTING_BALANCE = 100000;

export default function PaperTradingPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        window.location.href = '/sign-in';
        return;
      }

      const [{ data: rows }, allMarketsRes] = await Promise.all([
        supabase.from('positions').select('*').eq('user_id', userData.user.id),
        fetch('/api/markets').then((r) => r.json()),
      ]);

      const allMarkets = allMarketsRes.markets || [];
      const enriched = (rows || []).map((pos) => {
        const live = allMarkets.find((m) => m.id === pos.market_id);
        const livePrice =
          live && live.yesPrice !== null
            ? pos.side === 'YES'
              ? live.yesPrice
              : 100 - live.yesPrice
            : pos.entry_price;
        const shares = pos.amount / (pos.entry_price / 100);
        const currentValue = shares * (livePrice / 100);
        const pnl = currentValue - pos.amount;
        return { ...pos, livePrice, currentValue, pnl };
      });

      setPositions(enriched);
      setLoading(false);
    };
    load();
  }, []);

  const totalInvested = positions.reduce((sum, p) => sum + p.amount, 0);
  const totalCurrentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const cashAvailable = STARTING_BALANCE - totalInvested;
  const portfolioValue = cashAvailable + totalCurrentValue;
  const totalPnl = totalCurrentValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div className="px-8 py-12">
      <div className="inline-block border border-accent text-accent text-xs px-3 py-1 rounded mb-4">
        ▤ PAPER TRADING
      </div>
      <h1 className="text-4xl font-bold mb-2">Paper portfolio</h1>
      <p className="text-gray-500 mb-10">
        Practice trading with $100,000 in virtual capital. No real money involved.
      </p>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="border border-border rounded-lg p-6 bg-panel">
              <div className="text-xs text-gray-500 mb-2">CASH AVAILABLE</div>
              <div className="text-3xl font-bold tabular-nums">
                ${cashAvailable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="border border-border rounded-lg p-6 bg-panel">
              <div className="text-xs text-gray-500 mb-2">PORTFOLIO VALUE</div>
              <div className="text-3xl font-bold tabular-nums">
                ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="border border-border rounded-lg p-6 bg-panel">
              <div className="text-xs text-gray-500 mb-2">TOTAL P&L</div>
              <div
                className={`text-3xl font-bold tabular-nums ${
                  totalPnl >= 0 ? 'text-up' : 'text-down'
                }`}
              >
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500">
                {pnlPercent >= 0 ? '+' : ''}
                {pnlPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-3">OPEN POSITIONS</div>
          {positions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <p className="text-gray-500 mb-4">No open positions yet.</p>
              <Link href="/markets" className="border border-border px-6 py-2 rounded text-sm inline-block">
                BROWSE MARKETS
              </Link>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              {positions.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-b-0"
                >
                  <div>
                    <div className="font-semibold text-sm mb-1">{p.question}</div>
                    <div className="text-xs text-gray-500">
                      {p.side} · Entry {p.entry_price}¢ · Now {p.livePrice}¢
                    </div>
                  </div>
                  <div className={`font-bold tabular-nums ${p.pnl >= 0 ? 'text-up' : 'text-down'}`}>
                    {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-gray-600 text-xs mt-8">
            PAPER TRADING ONLY — NO REAL FUNDS. NOT FINANCIAL ADVICE.
          </p>
        </>
      )}
    </div>
  );
}
