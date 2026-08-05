'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MarketCard from '@/components/MarketCard';
import { createClient } from '@/lib/supabase-browser';

export default function WatchlistPage() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.href = '/sign-in';
      return;
    }

    const [{ data: watchlistRows }, allMarketsRes] = await Promise.all([
      supabase.from('watchlist').select('market_id').eq('user_id', userData.user.id),
      fetch('/api/markets').then((r) => r.json()),
    ]);

    const watchedIds = new Set((watchlistRows || []).map((r) => r.market_id));
    const allMarkets = allMarketsRes.markets || [];
    setMarkets(allMarkets.filter((m) => watchedIds.has(m.id)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="px-8 py-12">
      <div className="inline-block border border-accent text-accent text-xs px-3 py-1 rounded mb-4">
        ★ WATCHLIST
      </div>
      <h1 className="text-4xl font-bold mb-2">Your watchlist</h1>
      <p className="text-gray-500 mb-10">Markets you're tracking.</p>

      {loading && <p className="text-gray-500">Loading…</p>}

      {!loading && markets.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-gray-500 mb-4">No markets in your watchlist yet.</p>
          <Link href="/markets" className="border border-border px-6 py-2 rounded text-sm inline-block">
            BROWSE MARKETS
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {markets.map((m) => (
          <MarketCard
            key={m.id}
            market={m}
            isFavorited={true}
            isSignedIn={true}
            onFavoriteChange={load}
          />
        ))}
      </div>
    </div>
  );
}
