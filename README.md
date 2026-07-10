# 🎵 James Beats — Premium Spotify-Style Music PWA

A production-ready, fully functional music streaming Progressive Web App (PWA). Built with **React 18, Vite, TypeScript, Tailwind, shadcn/ui, and Supabase**. Fully themed in premium Black & Silver with gapless playback, crossfade transitions, and AI-powered recommendations.

---

## 🎮 Try the Demo First

**[▶ Launch Live Demo](https://demo.james-denning.com.ng/home)** ← Click to test the full UI/UX without any backend setup

The demo includes:
- ✅ Full interactive music player (play/pause/skip/shuffle/repeat)
- ✅ Browse 50+ sample songs with working audio
- ✅ Album and artist pages
- ✅ Playlists and favorites
- ✅ User profiles and authentication
- ✅ All premium features unlocked

**No sign-up needed!** Demo user auto-authenticates on load.

### Demo Details

| Aspect | Demo | Premium |
|--------|------|---------|
| **Player** | ✅ Full gapless + crossfade | ✅ Real streaming |
| **Catalog** | 50 sample songs | Millions (Audius API) |
| **Auth** | Auto-login demo user | Real email auth |
| **Database** | Local browser memory | Supabase Postgres |
| **Payments** | Mock modals | Paystack integration |
| **Admin** | Disabled | Full dashboard |

---

## 🚀 Get the Full Source Code & Start Your Streaming Business

This repository contains the **frontend-only demo** (safe to publish on GitHub). The full production-ready source code with backend, database, and deployment package is available for purchase.

| Package | What You Get | Link |
| :--- | :--- | :--- |
| **🎮 Frontend Demo** | React components + UI/UX (free, on GitHub) | [View on GitHub](https://github.com/kainechibuzo/james-beats-redline) |
| **💳 Full Source Code** | Complete backend + database + migrations + lifetime updates | **[👉 BUY NOW - $1,500+](https://chibuzokai.gumroad.com/l/ewymr)** |
| **🚀 Setup Service** | Deployment help + custom setup (optional add-on) | Email for quote |

---

## 💎 Why This Code is Worth $1,500+

* **Zero Royalty Fees:** Uses the public **Audius Discovery API** for streaming. Get millions of tracks out-of-the-box without paying licensing deals.
* **Free-to-Run Stack:** Runs perfectly fine on the Supabase free tier. Zero monthly backend overhead.
* **Monetization Built-In:** Fully wired with **Paystack integration** for subscription tiers (Free / Premium / Artist). Toggle feature gates instantly via your Admin Panel.
* **Web3/MiniPay Ready:** Built with micro-transactions in mind, making it highly adaptable for platforms like MiniPay, web wallets, and local African gateways.
* **AI-Powered Core:** Integrates with the Lovable AI Gateway for automated lyrics generation, custom DJ voice-overs, and smart playlist mood analysis.
* **Production-Ready:** ~130 React components, RLS-secured Postgres database, 15+ Edge Functions, full PWA setup.

---

## 🛠️ Feature Overview

### 🎧 Pro Player Engine
* **Gapless & Crossfade:** Dual-slot audio engine with custom crossfade transitions.
* **Smart Preload:** 3-second smart buffer and historical shuffle track caching.
* **System Integration:** Full Media Session API support (lock screen controls) and Wake Lock protection.

### 🔍 Discovery & Content
* **Dynamic Feeds:** Home, Explore, Radio stations, Podcasts, and Live Audio.
* **Time-Gated Mixes:** Daily Mixes, Mood Player, and a 60-day rule "Throwbacks" engine.
* **Yearly Wrapped:** Automated end-of-year recap engine for every user.

### 🔐 Auth, Profiles & Lyrics
* **Secure Auth:** Supabase Auth (email/password) fortified with Row Level Security (RLS) on Postgres.
* **Interactive Lyrics:** Real-time LRC file importer, manual text editor, and auto-scroll engine.
* **Social Tools:** Music Blends, Jam Sessions, and follower graphs.

### 👔 Admin Dashboard (Role-Gated)
* **One-Click Ingestion:** Seed entire music categories via keywords directly from Audius.
* **Track Protection:** Disables keyboard shortcuts and right-clicks to prevent audio ripping.
* **Gateway Controls:** Dynamically set Paystack checkout URLs to switch on premium gates.

---

## 💻 Tech Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TypeScript 5, Tailwind CSS 3, shadcn/ui |
| **Backend** | Supabase (Postgres Database, RLS, Edge Functions, Storage) |
| **Streaming** | Audius Discovery API (Public & Free) |
| **AI Processing** | Lovable AI Gateway (Gemini/OpenAI routing) |
| **Payments** | Paystack Gateway & Premium Gate Components |
| **PWA** | Vite PWA Plugin, Workbox, Media Session API, Wake Lock |

---

## 📦 What the Buyer Receives (Full Source)

1. **Full Frontend App:** Clean, hooks-first React + TypeScript components (~130 components).
2. **Database Architecture:** Complete `supabase/migrations/` directory containing the database schema and RLS policies.
3. **Backend Logic:** 15+ pre-written Supabase Edge Functions for AI routing and metadata tasks.
4. **PWA Assets:** Full Workbox service worker configuration and app icons.
5. **Deployment Guide:** Step-by-step instructions for Vercel, Netlify, or self-hosted.
6. **Admin Dashboard:** Complete artist/admin panel with music ingestion and settings.
7. **Lifetime Updates:** Access to future improvements and bug fixes.
8. **Email Support:** Direct access to the author for setup help.

---

## ⚡ Quick Start (Frontend Demo)

### 1. Clone & Install
```bash
git clone https://github.com/kainechibuzo/james-beats-redline.git
cd james-beats-redline
npm install
```

### 2. Run Locally
```bash
npm run dev
```

Visit http://localhost:5173 — you're automatically logged in as demo user!

### 3. Deploy to Vercel (Free)
```bash
npm run build
vercel deploy --prod
```

Your site will be live at `your-project.vercel.app` 🎉

---

## 🎯 For Demo Mode Only

The demo uses **local mock data** (no backend needed):

```typescript
// All data is hardcoded in browser memory
const MOCK_SONGS = [
  {
    id: 'song-1',
    title: 'Midnight Dreams',
    artist: 'Luna Echo',
    file_url: 'https://archive.org/download/Greatest_Hits/01.mp3',  // Free audio
    cover_url: 'https://images.unsplash.com/...',                   // Free image
  },
  // ... 50+ more
];
```

See `DEMO_MODE.md` for full customization guide.

---

## 🔐 Security & Privacy

**The demo is safe to make public because:**

✅ No real API credentials in the code  
✅ No database schema exposed  
✅ No payment keys visible  
✅ All data is local (browser-only)  
✅ No backend calls needed  

**Sensitive files are in `.gitignore`:**
- `.env` (real credentials)
- `supabase/functions/` (backend logic)
- `supabase/migrations/` (database schema)

---

## 📖 Documentation

- **[DEMO_MODE.md](./DEMO_MODE.md)** — Complete demo setup and customization guide
- **[.env.demo](./.env.demo)** — Safe environment variables (can be committed)
- **[src/integrations/supabase/client-demo.ts](./src/integrations/supabase/client-demo.ts)** — Mock Supabase client

---

## 🎓 Learn & Build

### Add Your Own Songs to Demo
Edit `src/data/mockData.ts`:
```typescript
export const MOCK_SONGS = [
  {
    id: 'your-song',
    title: 'Your Song',
    artist: 'Your Name',
    file_url: 'https://your-audio-url.mp3',
    cover_url: 'https://your-image-url.jpg',
    duration: 180,
  },
];
```

### Use Different Audio/Image Sources
- **Audio:** Freesound.org, Pexels Videos, Archive.org, your own CDN
- **Images:** Unsplash, Pexels, Pixabay, your own CDN

### Deploy to Production
```bash
# Vercel (recommended)
vercel deploy --prod

# Netlify
netlify deploy --prod

# Docker / Self-hosted
npm run build
docker build -t james-beats .
```

---

## 🎬 Screenshots

### Player View
![Player](https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600)

### Album Browse
![Albums](https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600)

### Playlist Management
![Playlists](https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600)

---

## 💰 Pricing & Licensing

| License | Use Case | Price | What's Included |
|---------|----------|-------|-----------------|
| **Demo (GitHub)** | Personal projects, portfolio, learning | Free | React components, UI/UX only |
| **Commercial License** | Business use, resale, white-label | $1,500+ | Full source + backend + database + updates |
| **Exclusive License** | Full ownership, remove attribution | $3,000+ | Everything + full rights + priority support |

**[👉 BUY NOW ON GUMROAD](https://chibuzokai.gumroad.com/l/ewymr)**

After purchase, you receive:
- ✅ Full source code (React + backend)
- ✅ Supabase database migrations
- ✅ 15+ Edge Functions
- ✅ Deployment guide
- ✅ Lifetime updates
- ✅ Email support

---

## ❓ FAQ

### Can I Use the Demo Commercially?
No. The demo is free for learning and portfolio purposes only. For commercial use, purchase the full license on Gumroad.

### How Do I Add Real Music?
Purchase the full source code, set up Supabase + Audius API, configure Paystack, and you'll have a fully functional streaming platform with millions of tracks.

### Can I Remove Your Branding?
The demo includes "James Beats" branding. The full commercial license allows you to white-label with your own branding.

### Is the Demo Safe for GitHub?
Yes! The demo has no real credentials or sensitive files. It's designed to be published publicly.

### How Long Does Setup Take?
- **Demo:** 5 minutes (clone → npm install → npm run dev)
- **Full Setup:** 1-2 hours with deployment guide included

### What Payment Methods Does Gumroad Accept?
Gumroad accepts all major credit cards, PayPal, Apple Pay, Google Pay, and more. See Gumroad checkout for full list.

### Do I Get Updates After Purchase?
Yes! The commercial license includes lifetime updates. You'll have access to all future improvements.

---

## 📬 Contact & Support

**Questions about the demo?**  
Open a GitHub Issue: https://github.com/kainechibuzo/james-beats-redline/issues

**Ready to buy the full source code?**  
👉 **[BUY ON GUMROAD - $1,500+](https://chibuzokai.gumroad.com/l/ewymr)**

**Need custom features or setup help?**  
Email: **kainechibuzo@gmail.com** (mention "custom setup")

---

## 📄 License & Terms

- **Demo (GitHub):** Open source for educational use. See LICENSE file.
- **Full Source Code:** Non-exclusive commercial license granted upon purchase via Gumroad.
- **Exclusive License:** Available for additional fee for white-label deployments.

---

## 🙏 Credits

- **Author:** Kaine Chibuzo ([@kainechibuzo](https://github.com/kainechibuzo))
- **Built with:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Supabase
- **Music API:** Audius Discovery API
- **Free Assets:** Unsplash (images), Archive.org (audio samples)

---

## 🚀 Ready to Launch?

1. **Try the demo:** [▶ Live Demo](https://demo.james-denning.com.ng/home)
2. **Read the guide:** See `DEMO_MODE.md`
3. **Deploy in 3 minutes:** Follow the Quick Start above
4. **Buy full source:** [👉 Purchase on Gumroad](https://chibuzokai.gumroad.com/l/ewymr)

**Let's build the next generation of music streaming! 🎵**

---

**Made with ❤️ by [Kaine Chibuzo](https://github.com/kainechibuzo)**
