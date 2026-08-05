import { NextResponse } from 'next/server';

export async function POST(req) {
  const { question, yesPrice, volume } = await req.json();

  const systemPrompt = `You are a neutral prediction-market analyst. You will be given a market question, its current price, and trading volume — nothing else.

Strict rules:
- Only reason from the exact data provided. Never reference specific news, statements, companies, or events unless that information was explicitly given to you.
- If you don't have enough context to explain the "why" behind a price, say so honestly rather than inventing a plausible-sounding reason.
- Never predict a certain outcome. Never say a market "will" resolve a certain way. Never guarantee anything.
- Keep the response to 3-4 sentences.
- Always end with exactly this sentence, verbatim: "This analysis is not financial advice."`;

  const userPrompt = `Market question: ${question}
Current YES price: ${yesPrice}%
24h-ish trading volume: $${volume}

Explain what this price and volume suggest, staying strictly within the rules above.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 220,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', errText);
      return NextResponse.json({ error: 'AI analysis unavailable.', debug: errText }, { status: 200 });
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'AI analysis unavailable.';

    return NextResponse.json({ analysis: text });
 } catch (err) {
    console.error('AI analysis error:', err);
    return NextResponse.json({ error: 'AI analysis unavailable.', debug: err.message }, { status: 200 });
  }
}
