# 🎵 James Beats - Frontend Demo Mode

## What is This?

This is a **frontend-only, browser-based demo** of James Beats, a premium Spotify-style music streaming PWA. All functionality runs **entirely in your browser** with no backend API calls, no credentials, and no real data.

✅ **What Works:**
- Full music player with play/pause, skip, shuffle, repeat
- Gapless playback and crossfade transitions
- Browse songs, albums, artists, playlists
- Like/unlike tracks and albums
- Search functionality
- User profiles and authentication UI
- All UI/UX exactly like the premium version

❌ **What's Mocked (Demo Only):**
- Database: All data is hardcoded locally (no Supabase)
- Audio: Uses free, copyright-safe archive.org samples
- Images: Uses free Unsplash images
- Authentication: Auto-login with demo user
- Payments: Premium modals show "Upgrade to unlock"
- Admin: Hidden behind demo auth check

---

## Why Demo-Only?

This demo showcases the **UI, UX, and interaction design** without exposing:
- ✅ Real database credentials
- ✅ Payment processing keys
- ✅ Backend API secrets
- ✅ Admin/artist upload systems

The premium version includes the full backend with real Supabase, payments, and artist tools.

---

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Demo Locally
```bash
npm run dev
```
Then open http://localhost:5173

### Deploy to Vercel (Free)
```bash
npm run build
vercel deploy
```

---

## How Data Works

All data is **local and mocked**:

```typescript
// src/data/mockData.ts
export const MOCK_SONGS = [
  {
    id: 'song-1',
    title: 'Midnight Dreams',
    artist: 'Luna Echo',
    file_url: 'https://archive.org/download/...',  // Free audio
    cover_url: 'https://images.unsplash.com/...',   // Free image
  },
  // ... 50+ more songs
];
```

When the app calls `supabase.from('songs').select()`, it **immediately returns mock data** from memory:

```typescript
// src/integrations/supabase/client-demo.ts
from(table: string) {
  return new MockPostgrestBuilder(table, mockDataMap[table]);
}
```

---

## Audio Sources

All demo audio uses **free, copyright-safe** sources:

- **Archive.org**: Classical music, public domain tracks
- **Freesound.org**: Creative Commons licensed samples (optional)
- **Pexels Videos**: Free audio tracks

These are **NOT** real Spotify/Audius streams—they're demo samples for UI testing.

---

## Image Sources

All images are from **Unsplash** (free, commercial use allowed):

```
https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop
```

No image storage or CDN required.

---

## Authentication

**Demo mode auto-authenticates** with a fake user:

```typescript
// src/contexts/AuthContext.demo.tsx
const DEMO_USER = {
  id: 'demo-user-xxx',
  email: 'demo@jamesbeats.local',
  user_metadata: { display_name: 'Demo User' },
};

// Always logged in
const [user, setUser] = useState(DEMO_USER);
```

No real Supabase Auth needed.

---

## Premium Features

All premium features **show modals, but don't require payment**:

```typescript
// src/components/subscription/PremiumFeatureGate.tsx
if (canAccess) return <>{children}</>;

return (
  <PremiumModal>
    <p>This feature is in the premium version.</p>
    <Button>View Premium Version → [Your Sales Page]</Button>
  </PremiumModal>
);
```

---

## File Structure

```
src/
├── integrations/supabase/
│   ├── client-demo.ts          ← Mock Supabase (NO real credentials)
│   ├── client.ts               ← Original (DON'T use in demo)
│   └── types.ts                ← Database types
├── data/
│   └── mockData.ts             ← 50+ sample songs, albums, playlists
├── contexts/
│   ├── AuthContext.demo.tsx    ← Auto-login (NO real auth)
│   ├── PlayerContext.tsx       ← Player logic (works as-is)
│   └── ...
├── components/
│   ├── subscription/
│   │   └── PremiumFeatureGate.tsx  ← Shows modal, no real payment
│   └── ...
└── ...

supabase/                        ← DELETE these before deploying
├── functions/                  (backend logic)
└── migrations/                 (database schema)

.env                             ← DELETE before deploying
.env.demo                        ← USE this instead
```

---

## Environment Variables

Create `.env.local` with:

```env
# Demo mode (no real API keys needed)
VITE_DEMO_MODE=true
VITE_SUPABASE_URL=https://demo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=demo-pk-not-real
```

All values are **dummy values**—the app doesn't call any external APIs.

---

## Customization

### Add More Songs

Edit `src/data/mockData.ts`:

```typescript
export const MOCK_SONGS = [
  {
    id: 'song-11',
    title: 'Your Song Title',
    artist: 'Your Artist',
    file_url: 'https://your-free-audio.url/song.mp3',
    cover_url: 'https://images.unsplash.com/...',
    duration: 180,
    genre: 'Your Genre',
    play_count: 0,
    is_public: true,
  },
];
```

### Change Demo User

Edit `src/contexts/AuthContext.demo.tsx`:

```typescript
const DEMO_USER = {
  id: 'custom-user-id',
  email: 'your@email.com',
  user_metadata: {
    display_name: 'Your Name',
  },
};
```

### Change Avatar

Edit `src/data/mockData.ts` profile section:

```typescript
avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yourname'
```

---

## Deploying to Vercel

### Step 1: Create Vercel Account
https://vercel.com/signup

### Step 2: Connect GitHub
```bash
vercel link
```

### Step 3: Deploy
```bash
npm run build
vercel deploy --prod
```

### Step 4: Share
- Your site is live at `your-project.vercel.app`
- Share the link to showcase your app
- Add to GitHub README
- Include link in portfolio

---

## What About the Premium Version?

**This demo includes:**
- ✅ Full React component library
- ✅ All UI/UX
- ✅ Player logic
- ✅ Routing & navigation

**Premium version adds:**
- 🔐 Real Supabase backend
- 💳 Paystack payment processing
- 🎵 Audius API integration
- 🎤 Artist upload system
- 🎨 Admin dashboard
- 🔒 Row-level security (RLS)
- 🤖 AI playlist generation
- 📊 Analytics & reporting

**To upgrade:**
1. Contact: kainechibuzo@gmail.com
2. Price: $1,500+ for lifetime access
3. Includes: Full source, database migrations, deployment guide

---

## Troubleshooting

### Audio Not Playing

**Problem:** Archive.org URL returns 403 error

**Solution:** Replace with another free audio source:
- Freesound.org API
- Pexels Videos
- Your own CDN

### Images Not Loading

**Problem:** Unsplash images show 403

**Solution:** Use another free image source:
- Pexels
- Pixabay
- Your own CDN

### App Won't Start

**Problem:** `npm run dev` fails

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Security

✅ **This demo is safe to make public because:**

1. **No credentials**: All API keys in the code are dummy values
2. **No database**: Data is hardcoded in the browser
3. **No authentication**: Auto-login with a fake user
4. **No payments**: Payment logic is stubbed
5. **No uploads**: Admin/artist features disabled

❌ **DO NOT commit the following:**

- `.env` (real credentials)
- `supabase/migrations/` (database schema)
- `supabase/functions/` (backend logic)

These are already in `.gitignore`.

---

## License

This demo is **free to use for personal projects**. 

For commercial use or resale, purchase the full premium version.

---

## Support

**Questions?** Email: kainechibuzo@gmail.com

**Ready to upgrade?** Purchase the full source code with backend, database, and deployment guide.
