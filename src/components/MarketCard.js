'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useCountUp } from '@/hooks/useCountUp';
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
  const animatedPrice = useCountUp(market.yesPrice ?? 0, 800);
  const animatedVolume = useCountUp(market.volume ?? 0, 900);

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
      className="card-enter group border border-border rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:shadow-card hover:-translate-y-1"
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
    >
      <div className="h-40 bg-panel flex items-center justify-center relative overflow-hidden">
        {market.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={market.image}
            alt=""
            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105 p-2"
          />
        ) : (
          <div className="text-gray-400 text-xs flex flex-col items-center gap-2">
            <span>MARKET</span>
          </div>
        )}
        <button
          onClick={toggleFavorite}
          disabled={saving}
          className="absolute top-2 left-2 bg-white/90 backdrop-blur w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm shadow-soft transition-transform hover:scale-110 active:scale-95"
        >
          {isFavorited ? '★' : '☆'}
        </button>
        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] px-2 py-1 rounded-full border border-border text-muted shadow-soft">
          Polymarket
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-3 leading-snug text-ink">{market.question}</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-panel rounded-lg p-2.5">
            <div className="text-[10px] text-muted mb-0.5">YES</div>
            <div className="text-accent font-semibold tabular-nums">
              {market.yesPrice !== null ? `${Math.round(animatedPrice)}¢` : '—'}
            </div>
          </div>
          <div className="bg-panel rounded-lg p-2.5">
            <div className="text-[10px] text-muted mb-0.5">VOL</div>
            <div className="font-semibold tabular-nums text-ink">{formatVolume(animatedVolume)}</div>
          </div>
        </div>

        <button
          onClick={() => (isSignedIn ? setShowTrade(true) : (window.location.href = '/sign-in'))}
          className="w-full border border-border rounded-lg py-2 text-xs font-medium text-ink mb-2 transition-colors hover:bg-panel active:scale-[0.98]"
        >
          ⇄ Paper trade
        </button>

        {!analysis && (
          <button
            onClick={getAnalysis}
            disabled={loadingAnalysis}
            className="w-full bg-accent/10 text-accentDark rounded-lg py-2 text-xs font-medium transition-colors hover:bg-accent/20 active:scale-[0.98] disabled:opacity-60"
          >
            {loadingAnalysis ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-accentDark border-t-transparent rounded-full animate-spin" />
                Generating…
              </span>
            ) : (
              '✧ AI analysis'
            )}
          </button>
        )}

        {analysis && (
          <div className="mt-3 bg-panel rounded-lg p-3 card-enter">
            <div className="text-[10px] text-accentDark font-semibold mb-2">✧ AI ANALYSIS</div>
            <p className="text-xs text-gray-600 leading-relaxed">{analysis}</p>
          </div>
        )}
      </div>

      {showTrade && (
        <TradeDialog market={market} onClose={() => setShowTrade(false)} />
      )}
    </div>
  );
}
