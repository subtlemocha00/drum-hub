# Drum Hub — Phase 2 Notes

Phase 2 adds the first drummer **training system** on top of the Phase 1
foundation, without changing the Phase 1 architecture:

- **Rudiment Library** — searchable, filterable, with detail pages.
- **Rudiment Practice Tracking** — explicit BPM logging, best/target BPM, total
  practice time (`users/{uid}/rudimentProgress/{rudimentId}`).
- **Groove Library** — browse + filter by style, save to favorites.
- **Warmups** — short routines with a step list and a built-in countdown timer.
- **Favorites** — cross-entity bookmarking of rudiments, grooves, and warmups.
- **Dashboard enhancements** — recently practiced rudiments, recently viewed
  grooves, "suggested next" (least recently practiced), and quick actions
  (Metronome, Start Session, Random Rudiment, Random Warmup).

## Data model (Firestore)

```
users/{uid}                          -> { displayName, email, createdAt }
users/{uid}/practiceSessions/{id}    -> { startTime, endTime, durationSeconds, createdAt }   (Phase 1)
users/{uid}/rudiments/{id}           -> { name, category, description, difficulty,
                                          notation, bpmMin, bpmMax, notes, videoUrl }
users/{uid}/rudimentProgress/{id}    -> { currentBPM, bestBPM, targetBPM,
                                          lastPracticedAt, totalPracticeTimeSeconds }
users/{uid}/grooves/{id}             -> { name, style, timeSignature, bpm,
                                          description, youtubeUrl, notes }
users/{uid}/warmups/{id}             -> { name, durationMinutes, focus, description, steps[] }
users/{uid}/favorites/{type_refId}   -> { type, refId, name, subtitle, createdAt }
```

### Catalog seeding

The starter rudiments / grooves / warmups are seeded into each user's
subcollections **automatically on first access** (see
`src/lib/firebase/seed.js`). Seeding is idempotent (only runs when the
collection is empty) and uses stable document ids so progress and favorites can
reference them. **No manual data import is required.**

> To re-seed after editing the starter catalogs in code, delete the
> corresponding subcollection for your user in the Firebase console; it will be
> recreated on next load.

---

## Required manual step: update Firestore security rules

The new subcollections are all under `users/{uid}/`, which the Phase 1 rules
already cover if you used the recursive pattern. The authoritative rules are in
[`firestore.rules`](./firestore.rules). Deploy them:

### Option A — Firebase console (no CLI)

1. Open the [Firebase console](https://console.firebase.google.com/) → your
   project (`drum-hub-0`).
2. **Build → Firestore Database → Rules** tab.
3. Paste the contents of `firestore.rules`.
4. Click **Publish**.

### Option B — Firebase CLI

```bash
npm install -g firebase-tools     # if not installed
firebase login
firebase use drum-hub-0
firebase deploy --only firestore:rules
```

(`firebase use` requires a `.firebaserc`; or run `firebase init firestore` once
and point it at the existing `firestore.rules`.)

---

## Firestore indexes

**None required.** All list/filter operations (category, style, focus, search)
are performed client-side over small seeded catalogs, and the only ordered query
(`practiceSessions` by `startTime`) uses a single-field index that Firestore
creates automatically. If you later add a `where(...).orderBy(...)` combination,
Firestore will log a console link to create the needed composite index.

---

## Other services — no changes needed

- **Authentication providers:** unchanged. Google + Email/Password from Phase 1
  remain the only providers.
- **No new backend services, databases, or paid APIs** were introduced.
- **Vercel:** no build-setting changes. The existing `VITE_FIREBASE_*`
  environment variables and the `vercel.json` SPA rewrite already cover the new
  client-side routes (`/rudiments`, `/grooves`, `/warmups`, `/favorites`, …).
- **PWA / manifest / service worker:** no manifest changes. `vite-plugin-pwa`
  (`registerType: 'autoUpdate'`) regenerates the precache on each build, so the
  new JS/CSS is cached automatically. Firestore reads are network-first via the
  SDK and are not affected by the precache.

---

## Local setup (unchanged from Phase 1)

```bash
npm install
npm run dev
```

`.env` already holds the Firebase config (`VITE_FIREBASE_*`). On first sign-in,
the starter catalogs seed themselves into your account.

## Verify

```bash
npm run check   # lint + production build
```
