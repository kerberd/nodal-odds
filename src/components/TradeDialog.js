'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function TradeDialog({ market, onClose }) {
  const [side, setSide] = useState('YES');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setSubmitting(true);
    setError('');

    const { data: userData } = await supabase.auth.getUser();
    const entryPrice = side === 'YES' ? market.yesPrice : 100 - market.yesPrice;

    const { error: insertError } = await supabase.from('positions').insert({
      user_id: userData.user.id,
      market_id: market.id,
      question: market.question,
      side,
      amount: numAmount,
      entry_price: entryPrice,
    });

    setSubmitting(false);
    if (insertError) {
      setError('Something went wrong. Try again.');
    } else {
      onClose();
      window.location.href = '/paper-trading';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border rounded-lg p-6 w-full max-w-sm">
        <h3 className="font-bold mb-1">Paper Trade</h3>
        <p className="text-xs text-gray-500 mb-4">{market.question}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide('YES')}
              className={`py-2 rounded border text-sm font-semibold ${
                side === 'YES' ? 'border-accent text-accent' : 'border-border text-gray-400'
              }`}
            >
              YES · {market.yesPrice}¢
            </button>
            <button
              type="button"
              onClick={() => setSide('NO')}
              className={`py-2 rounded border text-sm font-semibold ${
                side === 'NO' ? 'border-accent text-accent' : 'border-border text-gray-400'
              }`}
            >
              NO · {100 - market.yesPrice}¢
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-400">Amount (virtual USD)</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="w-full bg-base border border-border rounded px-3 py-2 mt-1 text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-accent text-white rounded py-2 text-sm font-semibold"
            >
              {submitting ? 'Placing…' : 'Place Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
