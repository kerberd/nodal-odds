'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import TradeDialog from './TradeDialog';

function formatVolume(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default function MarketCard({ market, isFavorited, onFavoriteChange, isSignedIn }) {
  const [saving, setSaving] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
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

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-panel">
      <div className="h-40 bg-base flex items-center justify-center relative">
        {market.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={market.image}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="text-gray-600 text-xs flex flex-col items-center gap-2">
            <span>MARKET</span>
          </div>
        )}
        <button
          onClick={toggleFavorite}
          disabled={saving}
          className="absolute top-2 left-2 bg-panel/90 w-7 h-7 rounded border border-border flex items-center justify-center text-sm"
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
          <div className="border border-border rounded p-2">
            <div className="text-[10px] text-gray-500">YES</div>
            <div className="text-accent font-bold tabular-nums">
              {market.yesPrice !== null ? `${market.yesPrice}¢` : '—'}
            </div>
          </div>
          <div className="border border-border rounded p-2">
            <div className="text-[10px] text-gray-500">VOL</div>
            <div className="font-bold tabular-nums">{formatVolume(market.volume)}</div>
          </div>
        </div>
        <button
          onClick={() => (isSignedIn ? setShowTrade(true) : (window.location.href = '/sign-in'))}
          className="w-full border border-border rounded py-2 text-xs font-semibold text-accent"
        >
          ⇄ PAPER TRADE
        </button>
      </div>

      {showTrade && (
        <TradeDialog market={market} onClose={() => setShowTrade(false)} />
      )}
    </div>
  );
}
