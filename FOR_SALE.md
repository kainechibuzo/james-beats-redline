# James Beats — For Sale

A production-ready, Spotify-style music streaming PWA. Built with React 18, Vite, TypeScript, Tailwind, shadcn/ui, and Supabase (Lovable Cloud). Fully themed (Black & Silver), mobile-first, installable as a PWA.

---

## Why buy this

- **Complete product, not a demo.** Auth, playback engine, admin panel, playlists, discovery, lyrics, DJ mode, analytics, subscriptions — all wired up.
- **Free-to-run stack.** Audius Discovery API for streaming (no API key, no royalty deals needed). Supabase free tier for backend. Lovable AI Gateway for AI features.
- **Monetization ready.** Paystack integration + subscription tiers (free / premium / artist) + admin-toggleable feature gating.
- **PWA.** Installable on iOS/Android/desktop, offline shell, media session, wake lock, background audio.
- **Clean codebase.** ~130 typed React components, hooks-first architecture, RLS-secured DB, edge functions for AI.

---

## Feature list

### Player
- Dual-slot audio engine with **gapless playback** and **crossfade** (mutually exclusive)
- 3-second preload, smart shuffle via `playedSongIdsRef` history
- Full-screen player, mini-player, floating scroll player
- Auto-skip on unplayable tracks
- Audio visualizer, equalizer, sleep timer, DJ mode with AI voice-overs
- Media Session API + Wake Lock

### Content & discovery
- Home, Explore, Search, Albums, Artists, Playlists, Liked, Recently Played
- Radio stations, Podcasts, Live audio, DJ mixes
- Discover Weekly, Daily Mix, Throwbacks (60+ day rule), Mood player
- Trending, Top Charts, New Releases, Artist Spotlight, Featured Albums
- Yearly Recap (Wrapped-style)

### Social & library
- User profiles with editable display name & avatar
- Playlists with folders, drag-drop reorder, share links
- Blends, Jam Sessions, follow system
- Listening history with dedupe & streaks
- Real-time lyrics (LRC import, manual editor, auto-scroll)

### Admin panel (role-gated via `user_roles` table)
- **Audius Catalog Seeder** — one-click bulk ingest of trending tracks by genre/keyword
- YouTube ingestion, playlist import, metadata fetch (legacy, can be removed)
- Album management, featured album promotion, artist promotion
- Bulk CSV import, folder-based upload
- Payment settings (Paystack URL toggle enables/disables premium gates)

### Auth & security
- Supabase Auth (email/password, ready for Google OAuth)
- Mandatory Terms of Use gate via `TermsGuard`
- Separate `user_roles` table (no privilege escalation risk)
- RLS on every table, security-definer `has_role()` function
- Track protection (disables right-click / keyboard shortcuts on audio)

### Monetization
- Paystack payment page integration (admin sets URL, gates activate)
- Subscription tiers: free / premium / artist
- `PremiumFeatureGate`, `PremiumBadge`, `UpgradeButton` components
- Premium features: AI DJ, Lyrics Generation, Sleep Timer, Equalizer, Crossfade, Advanced Stats

### AI features (Lovable AI Gateway — no API key needed)
- DJ mixes, playlist generation, mood analysis
- Lyrics generation, song insights, smart recommendations
- Party planner, workout mix, focus session, yearly wrapped

---

## Tech stack

| Layer     | Tech                                                          |
| --------- | ------------------------------------------------------------- |
| Frontend  | React 18, Vite 5, TypeScript 5, Tailwind CSS 3, shadcn/ui     |
| State     | React Query, React Context                                    |
| Backend   | Supabase (Postgres + RLS, Auth, Storage, Edge Functions)      |
| Streaming | Audius Discovery API (free, public, no key)                   |
| AI        | Lovable AI Gateway (Gemini/OpenAI routing)                    |
| PWA       | vite-plugin-pwa, Workbox, Media Session, Wake Lock            |
| Payments  | Paystack (URL-based checkout)                                 |

---

## What the buyer gets

- Full source code (this repo)
- Supabase schema + migrations (in `supabase/migrations/`)
- 15+ edge functions (in `supabase/functions/`)
- PWA manifest + icons
- Lovable project transfer (optional) or self-host instructions

## What the buyer needs to bring

- Their own Supabase project (free tier is fine) — connect via env vars in `.env`
- A Paystack account if they want paid subscriptions (optional)
- A domain (optional — deploys to `*.lovable.app` or any static host)

---

## Setup (buyer quickstart)

```bash
npm install
# Fill in .env with your Supabase URL + anon key
npm run dev
```

Deploy: any static host (Vercel, Netlify, Render, Lovable). `vercel.json` is included for SPA routing.

Run migrations against your Supabase project, then log in — the first user can be promoted to admin via the `user_roles` table.

---

## Suggested asking price

Comparable Spotify-clone codebases on CodeCanyon / Flippa sell for **$300–$2,500** depending on completeness. This one is on the higher end of completeness (admin panel, AI features, PWA, real streaming source wired in).

Reasonable ranges:
- Code-only license, non-exclusive: **$400–$800**
- Exclusive rights + Lovable project transfer: **$1,500–$3,000**
- With buyer support (setup call, 2 weeks of Q&A): **+$300–$500**

---

## Contact

Add your contact email / Twitter / Telegram here before listing.

Marketplaces to list on: **Flippa**, **CodeCanyon**, **Acquire.com** (formerly MicroAcquire), **Indie Hackers** for-sale threads, **X / Twitter** with #buildinpublic.
