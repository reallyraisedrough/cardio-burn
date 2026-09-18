# Cardio Burner

Dark, mobile-first Next.js workout PWA. Progressive goals, working sets + burnout, local history, Stripe test stubs + demo unlock.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — leave keys empty for Demo unlock
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Serve production build |

## Features

- **Home** — all exercises with last performance + personalized goal
- **Exercise detail** — form cues + Start workout
- **Workout** — working sets + red BURNOUT count-up; timer start/pause/reset; Web Audio beep + Notification API; reps for rep-based moves
- **Save** — compare vs goal, write IndexedDB history
- **Progress** — gated by Demo unlock / subscription
- **Subscribe** — `$5.99/mo`, `$25.99/6mo`, `$45.99/yr`, `$65.99` lifetime + Demo unlock
- **PWA** — `manifest.webmanifest` + basic service worker

## Exercises

planks, burpees, jogging, dips, lunges, squats, push-ups, sit-ups, skull crushers

## Stripe (test mode)

Create four Prices in Stripe Test mode matching:

- $5.99 / month
- $25.99 / 6 months
- $45.99 / year
- $65.99 lifetime (one-time)

Set in `.env.local`:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Price IDs as documented in `.env.example`

API routes:

- `POST /api/checkout` — Checkout Session when secret key is set; otherwise demo payload
- `POST /api/webhook` — signature-verified when secrets exist

Without keys, use **Demo unlock** on `/subscribe` so Progress works offline.

## Deploy (Vercel)
**Publish:** Import this repo in Vercel as a Next.js app, add Stripe env vars from `.env.example`, deploy.


1. Import `reallyraisedrough/cardio-burn` in Vercel
2. Framework: Next.js (auto)
3. Add the Stripe env vars (test first)
4. Deploy — then set Stripe webhook to `https://YOUR_DOMAIN/api/webhook`

## Disclaimer

Not medical advice. Stop if you feel pain, dizziness, or unusual discomfort.
