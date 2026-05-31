# James Beats — Phased Plan

I will ship **Phase 1 this turn**. Phases 2–5 each ship in a follow-up message after you confirm Phase 1 looks good. Trying to do all five at once would produce broken half-features.

---

## Phase 1 — Stabilize (THIS TURN)

**Goal:** App stops misbehaving. Audio never stops on its own.

1. **Remove Radio & Live pages**
   - Delete `src/pages/Radio.tsx`, `src/pages/Live.tsx`, routes in `App.tsx`, links in `Sidebar.tsx` and `BottomNav.tsx`.
   - Keep DB tables (per your answer).

2. **Stop full page reloads on nav**
   - Audit for `<a href>` instead of `<Link>` and `window.location.href` usages in nav components; convert to `react-router` `Link`/`navigate`.
   - This is the root cause of audio cutting out between pages.

3. **Persistent playback**
   - Player already lives in `MainLayout`; verify it never unmounts on route change.
   - Persist current song + position to `localStorage` every 5s; on app load, restore song (paused) so user can resume. Audio never auto-pauses on navigation.

4. **Recent Rotation flashing**
   - Fix `useRecentlyPlayed` / `useTrendingSongs` query keys + add `placeholderData: keepPreviousData` and stable sort to stop re-render churn.

5. **"Add to Library" album action**
   - Inspect handler in `Album.tsx` / `Albums.tsx`, repair insert into `liked_albums`.

6. **Explore page**
   - Read `src/pages/Explore.tsx`, repair whatever is throwing.

---

## Phase 2 — YouTube Ingestion Upgrades

- Strict **official-channel-only** ingest for popular searches: accept channels matching `*- Topic`, `*VEVO`, or YouTube `verified` flag. Indie (low result count or user opt-in) keeps current behavior.
- **Ingest albums**: given a YouTube playlist URL or auto-detected `*- Topic` "Album - X" playlist, create an `albums` row + child `songs` rows with positions.
- **Ingest playlists**: admin paste-a-playlist-URL flow → user-owned playlist with songs.
- **Tag-based auto playlists**: pull YouTube `tags[]` + `categoryId` per video into a new `song_tags` table; nightly edge job builds "Made From Your Tags" generated playlists per user from their listening history.

---

## Phase 3 — Metadata Engine + Profiles

- New tables: `artists`, `artist_aliases`, plus expand `albums` and `songs` with `release_date`, `popularity`, `streaming_provider`, `playback_source`, `licensing_status`, `artist_owned`.
- Nightly ingestion edge function refreshes metadata from YouTube + (optional) MusicBrainz.
- **Artist profile page** `/artist/:id`: image, bio, discography, albums, songs, rankings, awards, fan count, votes.
- **Album profile page** `/album/:id`: artwork, tracks, ratings, ranking history.
- **Song profile page** `/song/:id`: artwork, votes, ranking position.

---

## Phase 4 — Voting, Charts, Awards

- Tables: `votes` (entity_type, entity_id, user_id, day), `chart_snapshots`, `awards`, `award_nominees`, `award_votes`, `user_reputation`.
- Daily vote limits, IP+reputation fraud guard.
- Charts: Global Top 100, Nigeria Top 100, Trending Songs/Artists/Albums, Most Voted, Fastest Rising, Weekly Movers. Computed by scheduled edge function into `chart_snapshots`.
- Awards: Artist of Month/Year, Song/Album of Year, Fan Favorite, Best New, Best African, Community Choice. Seasonal nomination + voting windows.

---

## Phase 5 — Community

- Artist following, fan clubs, comments, reactions, predictions, polls, share cards.

---

## Technical notes (Phase 1 specifics)

- `App.tsx`: drop `<Route path="/radio">` and `<Route path="/live">`. Remove imports.
- `Sidebar.tsx` / `BottomNav.tsx`: remove Radio + Live entries.
- `PlayerContext.tsx`: add `useEffect` that on mount reads `localStorage.jb:lastTrack` and sets `currentSong` (paused, with `seekTime`), and an interval that writes `{songId, position}` while playing.
- `useRecentlyPlayed.ts` (and recent-rotation widget): `placeholderData: (prev) => prev`, dedupe by `song_id`, sort by `played_at desc`, cap to N, memoize the array so child cards don't remount.
- `Explore.tsx`: read first, then fix the actual throw (likely a stale hook from Radio/Live removal).

After Phase 1 ships and you confirm it feels solid, reply "Phase 2" and I'll proceed.