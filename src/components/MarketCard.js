'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import TradeDialog from './TradeDialog';

function formatVolume(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default function MarketCard({ market, isFavorited, onFavoriteChange, isSignedIn, index = 0 }) {
  const [saving, setSaving] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const supabase = createClient();

  const toggleFavorite = async () => {
    if (!isSignedIn) {
      window.location.href = '/sign-in';
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;

    if (isFavorited) {
      await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('market_id', market.id);
    } else {
      await supabase.from('watchlist').insert({
        user_id: userId,
        market_id: market.id,
        question: market.question,
        image: market.image,
      });
    }
    setSaving(false);
    onFavoriteChange?.();
  };

  const getAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: market.question,
          yesPrice: market.yesPrice,
          volume: market.volume,
        }),
      });
      const data = await res.json();
      setAnalysis(data.analysis || data.error || 'AI analysis unavailable.');
    } catch (err) {
      setAnalysis('AI analysis unavailable.');
    }
    setLoadingAnalysis(false);
  };

  return (
    <div
      className="card-enter group border border-border rounded-lg overflow-hidden bg-panel transition-all duration-300 hover:border-accent hover:shadow-[0_0_24px_-4px_rgba(59,130,246,0.35)] hover:-translate-y-1"
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
    >
      <div className="h-40 bg-base flex items-center justify-center relative overflow-hidden">
        {market.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={market.image}
            alt=""
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="text-gray-600 text-xs flex flex-col items-center gap-2">
            <span>MARKET</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent opacity-60" />
        <button
          onClick={toggleFavorite}
          disabled={saving}
          className="absolute top-2 left-2 bg-panel/90 w-7 h-7 rounded border border-border flex items-center justify-center text-sm transition-transform hover:scale-110 active:scale-95"
        >
          {isFavorited ? '★' : '☆'}
        </button>
        <span className="absolute top-2 right-2 bg-panel/90 text-[10px] px-2 py-1 rounded border border-border">
          POLYMARKET
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-3 leading-snug">{market.question}</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="border border-border rounded p-2 transition-colors group-hover:border-accent/40">
            <div className="text-[10px] text-gray-500">YES</div>
            <div className="text-accent font-bold tabular-nums">
              {market.yesPrice !== null ? `${market.yesPrice}¢` : '—'}
            </div>
          </div>
          <div className="border border-border rounded p-2 transition-colors group-hover:border-accent/40">
            <div className="text-[10px] text-gray-500">VOL</div>
            <div className="font-bold tabular-nums">{formatVolume(market.volume)}</div>
          </div>
        </div>

        <button
          onClick={() => (isSignedIn ? setShowTrade(true) : (window.location.href = '/sign-in'))}
          className="w-full border border-border rounded py-2 text-xs font-semibold text-accent mb-2 transition-colors hover:bg-accent hover:text-white active:scale-[0.98]"
        >
          ⇄ PAPER TRADE
        </button>

        {!analysis && (
          <button
            onClick={getAnalysis}
            disabled={loadingAnalysis}
            className="w-full border border-border rounded py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white active:scale-[0.98] disabled:opacity-60"
          >
            {loadingAnalysis ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Generating…
              </span>
            ) : (
              '✧ AI ANALYSIS'
            )}
          </button>
        )}

        {analysis && (
          <div className="mt-3 border border-border rounded p-3 bg-base card-enter">
            <div className="text-[10px] text-accent font-semibold mb-2">✧ AI ANALYSIS</div>
            <p className="text-xs text-gray-300 leading-relaxed">{analysis}</p>
          </div>
        )}
      </div>

      {showTrade && (
        <TradeDialog market={market} onClose={() => setShowTrade(false)} />
      )}
    </div>
  );
}
