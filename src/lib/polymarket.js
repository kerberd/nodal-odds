// Fetches live market data from Polymarket's public Gamma API.
// No API key required for read-only market data.
export async function fetchTopMarkets(limit = 200) {
  const res = await fetch(
    `https://gamma-api.polymarket.com/markets?limit=${limit}&active=true&closed=false`,
    { next: { revalidate: 15 } }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch Polymarket data');
  }

  const data = await res.json();

  const seen = new Set();
  return data
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return Number(m.volumeNum) >= 5000;
    })
    .map((m) => {
      let yesPrice = null;
      try {
        const prices = JSON.parse(m.outcomePrices || '[]');
        yesPrice = prices[0] ? Math.round(Number(prices[0]) * 100) : null;
      } catch (e) {
        yesPrice = null;
      }

      return {
        id: m.id,
        question: m.question,
        image: m.image || null,
        icon: m.icon || null,
        yesPrice,
        volume: Number(m.volumeNum) || 0,
        endDate: m.endDate,
        slug: m.slug,
      };
    })
    .sort((a, b) => b.volume - a.volume);
}
