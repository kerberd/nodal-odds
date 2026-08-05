'use client';

import { useEffect, useState } from 'react';
import MarketCard from '@/components/MarketCard';
import { createClient } from '@/lib/supabase-browser';

export default function MarketsPage() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [isSignedIn, setIsSignedIn] = useState(false);
  const supabase = createClient();

  const loadFavorites = async (userId) => {
    const { data } = await supabase
      .from('watchlist')
      .select('market_id')
      .eq('user_id', userId);
    setFavoritedIds(new Set((data || []).map((row) => row.market_id)));
  };

  useEffect(() => {
    fetch('/api/markets')
      .then((res) => res.json())
      .then((data) => {
        setMarkets(data.markets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsSignedIn(true);
        loadFavorites(data.user.id);
      }
    });
  }, []);

  return (
    <div className="px-8 py-12">
      <div className="inline-block border border-accent text-accent text-xs px-3 py-1 rounded mb-4">
        ● LIVE MARKETS
      </div>
      <h1 className="text-4xl font-bold mb-2">Live prediction markets</h1>
      <p className="text-gray-500 mb-10">
        Real-time prices and trading volume, filtered to markets above $5K volume. Powered by Polymarket.
      </p>

      {loading && <p className="text-gray-500">Loading live markets…</p>}

      {!loading && markets.length === 0 && (
        <p className="text-gray-500">Live data unavailable.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
       {markets.slice(0, visibleCount).map((m, i) => (
          <MarketCard
            key={m.id}
            market={m}
            index={i}
            isFavorited={favoritedIds.has(m.id)}
            isSignedIn={isSignedIn}
            onFavoriteChange={async () => {
              const { data } = await supabase.auth.getUser();
              if (data.user) loadFavorites(data.user.id);
            }}
          />
        ))}
      </div>

      {visibleCount < markets.length && (
        <div className="text-center mt-8">
          <button
            onClick={() => setVisibleCount((c) => c + 12)}
            className="border border-border px-6 py-2 rounded text-sm"
          >
            LOAD MORE MARKETS
          </button>
        </div>
      )}
    </div>
  );
}
