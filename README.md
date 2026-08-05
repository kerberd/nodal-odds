# Nodal Odds

AI-powered market intelligence terminal for prediction markets. Built with Next.js and Supabase.

## What's included in this starter

- Public landing page + pricing page
- Supabase email/password + Google sign-up and sign-in
- Live Polymarket market data (via `/api/markets`, filtered to markets above $5K volume)
- Dark terminal-style UI matching the design direction already validated

## Not yet included (next steps)

- Watchlist page
- Paper trading page
- AI Analysis (needs an OpenAI/Anthropic key wired into a server route)

## Local setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` — it's already filled in with your Supabase project's URL and publishable key.
3. Run locally:
   ```
   npm run dev
   ```
4. Visit `http://localhost:3000`

## Deploying

See the deployment walkthrough provided separately — push this folder to a new GitHub repository, then import that repository in Vercel. Add the same two environment variables from `.env.local` in Vercel's project settings before deploying.

## Enabling Google sign-in

In your Supabase project: Authentication → Providers → Google, and follow Supabase's setup guide to add your Google OAuth credentials. Email/password sign-in works immediately with no extra setup.
