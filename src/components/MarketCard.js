'use client';

function formatVolume(v) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default function MarketCard({ market }) {
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
      </div>
    </div>
  );
}
