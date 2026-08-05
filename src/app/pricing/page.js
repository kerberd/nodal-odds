import Link from 'next/link';

const features = [
  'Live prediction market dashboard',
  'AI-powered market analysis on demand',
  'Personal watchlist with real-time prices',
  'Paper trading with $100,000 virtual capital',
  'Open positions tracker with live P&L',
  'Unlimited markets and analysis',
];

export default function PricingPage() {
  return (
    <div className="px-8 py-20 text-center">
      <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
      <p className="text-gray-400 mb-16">
        One plan. Everything you need to research and trade prediction markets.
      </p>

      <div className="max-w-md mx-auto border border-accent rounded-lg p-8 bg-panel text-left">
        <div className="flex items-center justify-between mb-4">
          <span className="text-accent font-bold">PRO</span>
          <span className="text-xs border border-border px-2 py-1 rounded">MONTHLY</span>
        </div>
        <div className="mb-4">
          <span className="text-5xl font-bold">$19.99</span>
          <span className="text-gray-500"> /month</span>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Full access to live markets, AI analysis, and paper trading.
        </p>
        <Link
          href="/sign-up"
          className="block text-center bg-accent text-white py-3 rounded font-semibold mb-6"
        >
          GET STARTED →
        </Link>
        <ul className="space-y-3 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-gray-600 text-xs mt-8">
        PAPER TRADING IS RISK-FREE. NOT FINANCIAL ADVICE.
      </p>
    </div>
  );
}
