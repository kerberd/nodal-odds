'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { useCountUp } from '@/hooks/useCountUp';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const STARTING_BALANCE = 100000;

function Stat({ value, prefix = '', suffix = '', decimals = 2, label, tone = 'ink' }) {
  const animated = useCountUp(value, 1000);
  const toneClass = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-ink';
  return (
    <div className="border border-border rounded-2xl p-6 bg-white">
      <div className="text-xs text-muted mb-2">{label}</div>
      <div className={`text-3xl font-semibold tabular-nums ${toneClass}`}>
        {prefix}
        {animated.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState([]);
  const [positions, setPositions] = useState([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        window.location.href = '/sign-in';
        return;
      }

      const [marketsRes, { data: posRows }, { data: watchRows }] = await Promise.all([
        fetch('/api/markets').then((r) => r.json()),
        supabase.from('positions').select('*').eq('user_id', userData.user.id),
        supabase.from('watchlist').select('id').eq('user_id', userData.user.id),
      ]);

      setMarkets(marketsRes.markets || []);
      setPositions(posRows || []);
      setWatchlistCount((watchRows || []).length);
      setLoading(false);
    };
    load();
  }, []);

  const totalInvested = positions.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCurrentValue = positions.reduce((sum, p) => {
    const live = markets.find((m) => m.id === p.market_id);
    if (!live || !p.entry_price || p.entry_price <= 0) return sum + Number(p.amount);
    const livePrice = p.side === 'YES' ? live.yesPrice : 100 - live.yesPrice;
    const shares = p.amount / (p.entry_price / 100);
    return sum + shares * (livePrice / 100);
  }, 0);
  const cashAvailable = STARTING_BALANCE - totalInvested;
  const portfolioValue = cashAvailable + totalCurrentValue;
  const totalPnl = totalCurrentValue - totalInvested;

  const chartData = markets
    .slice()
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8)
    .map((m) => ({
      name: m.question.length > 22 ? m.question.slice(0, 22) + '…' : m.question,
      volume: Math.round(m.volume / 1000000),
    }));

  return (
    <div className="px-8 py-12 max-w-6xl mx-auto">
      <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 text-xs text-muted mb-4 bg-white shadow-soft">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        Dashboard
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-ink mb-2">Your overview</h1>
      <p className="text-muted mb-10">Portfolio performance and market activity at a glance.</p>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Stat value={portfolioValue} prefix="$" label="Portfolio value" />
            <Stat value={cashAvailable} prefix="$" label="Cash available" />
            <Stat
              value={totalPnl}
              prefix={totalPnl >= 0 ? '+$' : '-$'}
              decimals={2}
              label="Total P&L"
              tone={totalPnl >= 0 ? 'up' : 'down'}
            />
            <Stat value={watchlistCount} decimals={0} label="Markets watched" />
          </div>

          <div className="border border-border rounded-2xl p-6 bg-white mb-10">
            <h2 className="font-semibold text-ink mb-1">Top markets by volume</h2>
            <p className="text-xs text-muted mb-6">Live trading volume across the largest active markets, in millions.</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}M`}
                  />
                  <Tooltip
                    formatter={(v) => [`$${v}M`, 'Volume']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill="#6366f1" fillOpacity={1 - i * 0.08} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-sm">Live data unavailable.</p>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              href="/markets"
              className="border border-border px-5 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-panel transition-colors"
            >
              Browse markets
            </Link>
            <Link
              href="/paper-trading"
              className="border border-border px-5 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-panel transition-colors"
            >
              View paper trading
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
