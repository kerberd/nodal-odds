import Link from 'next/link';

const steps = [
  {
    step: 'STEP 1',
    title: 'Explore live markets',
    body: 'Track real-time odds, prices, and trading volume across prediction markets in a single terminal dashboard.',
  },
  {
    step: 'STEP 2',
    title: 'Get AI analysis',
    body: 'Generate neutral, data-driven analysis on any market in one click — reasoning from the numbers, not the news.',
  },
  {
    step: 'STEP 3',
    title: 'Practice with paper trading',
    body: 'Trade with $100,000 in virtual capital. Build a portfolio and track P&L with zero risk.',
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="px-8 py-24 max-w-4xl">
        <div className="inline-block border border-accent text-accent text-xs px-3 py-1 rounded mb-6">
          ● AI-POWERED MARKET INTELLIGENCE
        </div>
        <h1 className="text-6xl font-bold leading-tight mb-6">
          See what the world thinks happens next.
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-xl">
          Nodal Odds brings real-time prediction market prices, AI-generated analysis,
          and risk-free paper trading into one terminal.
        </p>
        <div className="flex gap-4">
          <Link href="/sign-up" className="bg-accent text-white px-6 py-3 rounded font-semibold">
            GET STARTED →
          </Link>
          <Link href="/pricing" className="border border-border px-6 py-3 rounded font-semibold">
            VIEW PRICING
          </Link>
        </div>
      </section>

      <section className="bg-panel px-8 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-2">How it works</h2>
          <p className="text-gray-500">Three steps from market data to confident decisions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((s) => (
            <div key={s.step} className="border border-border rounded-lg p-6 bg-base">
              <div className="text-xs text-gray-500 mb-4">{s.step}</div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
