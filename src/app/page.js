'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useCountUp } from '@/hooks/useCountUp';

const steps = [
  {
    step: '01',
    title: 'Explore live markets',
    body: 'Track real-time odds, prices, and trading volume across prediction markets in one clean dashboard.',
  },
  {
    step: '02',
    title: 'Get AI analysis',
    body: 'Generate neutral, data-driven analysis on any market in one click — reasoning from the numbers, not the news.',
  },
  {
    step: '03',
    title: 'Practice with paper trading',
    body: 'Trade with $100,000 in virtual capital. Build a portfolio and track P&L with zero risk.',
  },
];

function StatCounter({ value, prefix = '', suffix = '', decimals = 0, label }) {
  const animated = useCountUp(value, 1400);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-semibold tracking-tight text-ink tabular-nums">
        {prefix}
        {animated.toFixed(decimals)}
        {suffix}
      </div>
      <div className="text-muted text-sm mt-2">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState({ count: 0, volume: 0 });
  const [previewMarkets, setPreviewMarkets] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        window.location.href = '/markets';
      } else {
        setChecking(false);
      }
    });

    fetch('/api/markets')
      .then((r) => r.json())
      .then((data) => {
        const markets = data.markets || [];
        const totalVolume = markets.reduce((sum, m) => sum + m.volume, 0);
        setStats({ count: markets.length, volume: totalVolume / 1000000 });
        setPreviewMarkets(markets.slice(0, 3));
      })
      .catch(() => {});
  }, [supabase]);

  if (checking) {
    return <div className="px-8 py-24 text-muted">Loading…</div>;
  }

  return (
    <div>
      <section className="hero-gradient px-8 pt-24 pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 text-xs text-muted mb-8 bg-white shadow-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI-powered market intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-ink mb-6">
            See what the world thinks happens next.
          </h1>
          <p className="text-muted text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Nodal Odds brings real-time prediction market prices, AI-generated
            analysis, and risk-free paper trading into one clean workspace.
          </p>
          <div className="flex items-center justify-center gap-3 mb-20">
            <Link
              href="/sign-up"
              className="bg-ink text-white px-6 py-3 rounded-lg font-medium hover:bg-black/80 transition-colors shadow-soft"
            >
              Get started
            </Link>
            <Link
              href="/pricing"
              className="border border-border px-6 py-3 rounded-lg font-medium text-ink hover:bg-panel transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>

        {previewMarkets.length > 0 && (
          <div className="max-w-4xl mx-auto relative h-64 md:h-72 hidden sm:block">
            {previewMarkets.map((m, i) => (
              <div
                key={m.id}
                className="card-enter absolute bg-white border border-border rounded-2xl shadow-card p-4 w-72"
                style={{
                  left: `${i * 26}%`,
                  top: `${i % 2 === 0 ? 0 : 40}px`,
                  animationDelay: `${300 + i * 150}ms`,
                  transform: `rotate(${i === 0 ? -4 : i === 1 ? 2 : -2}deg)`,
                  zIndex: 3 - i,
                }}
              >
                <div className="text-[10px] text-muted mb-1">POLYMARKET</div>
                <div className="text-sm font-semibold text-ink mb-3 leading-snug line-clamp-2">
                  {m.question}
                </div>
                <div className="flex gap-2">
                  <div className="bg-panel rounded-lg px-2 py-1 text-xs">
                    <span className="text-muted">YES </span>
                    <span className="text-accent font-semibold">{m.yesPrice}¢</span>
                  </div>
                  <div className="bg-panel rounded-lg px-2 py-1 text-xs text-ink font-semibold">
                    ${(m.volume / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-8 py-16 border-y border-border bg-panel">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-8">
          <StatCounter value={stats.count} label="Live markets tracked" />
          <StatCounter value={stats.volume} prefix="$" decimals={1} suffix="M+" label="Volume tracked" />
        </div>
      </section>

      <section className="px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-ink mb-2">How it works</h2>
          <p className="text-muted">Three steps from market data to confident decisions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((s) => (
            <div
              key={s.step}
              className="border border-border rounded-2xl p-8 bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-sm text-accent font-semibold mb-6">{s.step}</div>
              <h3 className="font-semibold text-lg text-ink mb-2">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
