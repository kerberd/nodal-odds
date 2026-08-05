'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-border">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-bold tracking-wider text-sm">
          ● NODAL ODDS
        </Link>
        {user ? (
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/markets" className="hover:text-accent">MARKETS</Link>
            <Link href="/watchlist" className="hover:text-accent">WATCHLIST</Link>
            <Link href="/paper-trading" className="hover:text-accent">PAPER TRADING</Link>
          </div>
        ) : (
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-accent">HOME</Link>
            <Link href="/pricing" className="hover:text-accent">PRICING</Link>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <span className="text-gray-500">{user.email}</span>
            <button onClick={handleSignOut} className="border border-border px-3 py-1.5 rounded">
              SIGN OUT
            </button>
          </>
        ) : (
          <Link href="/sign-in" className="bg-accent text-white px-4 py-1.5 rounded font-semibold">
            SIGN IN
          </Link>
        )}
      </div>
    </nav>
  );
}
