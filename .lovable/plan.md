# Audius Full Swap + Terms Fix

## 1. Terms of Use error (quick fix, ship first)

The FK error means the browser is holding a session for a `user_id` that no longer exists in `auth.users` (leftover from the delete-all-users migration). Two changes:

- **`src/pages/Terms.tsx`** — detect Postgres error `23503` (`profiles_user_id_fkey`) → call `supabase.auth.signOut()` and redirect to `/auth` with a toast: "Your session expired, please sign in again."
- **`src/contexts/AuthContext.tsx`** — on `INITIAL_SESSION` / `SIGNED_IN`, run `supabase.auth.getUser()`. If it returns `user_not_found` / 403, sign out silently. Prevents any authenticated page from showing FK errors after user deletion.

## 2. Audius native playback (full swap)

### 2a. Edge function `audius-ingest`

New Deno function at `supabase/functions/audius-ingest/index.ts`.

- No secrets — Audius discovery API is public. Pick a host from `https://api.audius.co` (returns list of discovery nodes), cache one.
- Body: `{ kind: "trending" | "genre" | "search", value?: string, limit?: number }`.
- Endpoints used:
  - Trending: `/v1/tracks/trending?time=week&genre=<genre>&app_name=jamesbeats`
  - Search: `/v1/tracks/search?query=<q>&app_name=jamesbeats`
- Map each track → row in `songs`:
  - `title`, `artist = user.name`, `genre`, `duration`, `is_public: true`
  - `cover_url = artwork["480x480"]` (or 1000)
  - `file_url = <host>/v1/tracks/<id>/stream?app_name=jamesbeats` (302 → mp3, works in `<audio>`)
  - `source = "audius"`
  - `youtube_video_id = "audius:" + track.id` (reuses the existing UNIQUE index for dedupe)
- Upsert with `onConflict: "youtube_video_id", ignoreDuplicates: true`.

### 2b. Admin UI `AudiusSeeder`

New component `src/components/admin/AudiusSeeder.tsx` mounted in the existing `yt-seed` tab of `Admin.tsx`. Buttons:
- Import Trending (week, all genres)
- Import by Genre (dropdown: Hip-Hop, R&B, Electronic, Pop, Rock, etc.)
- Free-text search + import

### 2c. Player refactor — route by `source`

The player is fully YouTube-IFrame today. Introduce a source-aware wrapper.

- **New helper** `src/lib/playerEngines.ts`
  ```text
  type Engine = "youtube" | "audius"
  pickEngine(song) => song.source === "audius" ? "audius" : "youtube"
  ```
- **New audio-element engine** `src/lib/audiusEngine.ts` — thin API mirroring the YT player surface the context uses today: `loadUrl(url)`, `play()`, `pause()`, `seekTo(s)`, `setVolume(0-100)`, `getCurrentTime()`, `getDuration()`, plus `onEnded` / `onReady` / `onStateChange` callbacks. Backed by two `HTMLAudioElement`s (matches the existing two-slot `active/inactive` design so crossfade still works).
- **`src/contexts/PlayerContext.tsx`** rewrites:
  - Replace the single YT-only `getActive()` / `loadVideoById` calls with an engine dispatch. Each of the two slots holds either a YT player or an `AudioElement` depending on the currently loaded song.
  - `playSongInternal`: if engine === "audius" → `audiusEngine.loadUrl(song.file_url)`, else current YT path. Remove the `if (!song.youtube_video_id) return;` guard for audius songs.
  - Crossfade: keep the 250ms poller; when triggered, prep the inactive slot using the next song's engine (YT `loadVideoById` OR audio-element `.src = ...; .load()`) and fade volumes.
  - Preload: same — inactive slot loads next audius URL via `<audio preload="auto">` or YT `cueVideoById`.
  - Volume ramp uses each engine's `setVolume` uniformly.
- **`src/components/layout/Player.tsx`** — mount two `<audio>` elements (hidden) alongside the two YT iframes. Wire them into the engine on mount.
- **Visualizer** (`AudioVisualizer.tsx`) currently taps YT — for audius engine wire a WebAudio `AnalyserNode` off the active `<audio>`.
- **`buildSimilarQueue`** in PlayerContext — drop the `!r.youtube_video_id` skip for audius rows.

### 2d. Discovery/recommendation hooks

No schema change needed. Existing genre-based similar-queue logic already keys off `genre`, which Audius populates well. Once audius rows are ingested, hooks like `useForYou`, `useTrendingSongs`, `useGenreExplorer` pick them up automatically.

## Technical notes

- Audius stream endpoint 302-redirects to a signed mp3. Browsers follow redirects on `<audio>` transparently.
- CORS: Audius discovery + stream serve permissive CORS.
- Track id column: reusing `youtube_video_id` as the universal external id avoids a migration. If desired later, rename to `external_id`.
- Rollback: because YT rows are untouched and the engine dispatch is by `source`, disabling audius = just stop ingesting new audius rows (or delete them).

## Ship order

1. Terms fix (1 file + 1 file, safe, unblocks the user immediately).
2. Audius edge function + admin seeder (backend only, no player risk).
3. Player refactor (biggest risk — do last, in isolation).
