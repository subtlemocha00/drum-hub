# Drum Hub — Phase 4 Notes

Phase 4 is **content expansion & curation**. It adds no major new feature
surface — instead it makes Drum Hub *genuinely useful* by massively growing the
built-in libraries, wiring content together, and personalizing the experience so
a brand-new drummer can practice for months without leaving the app. All Phase
1–3 features are preserved.

## What shipped

- **Expanded Rudiment Library** — 40 rudiments across rolls, paradiddles, flams,
  drags, ratamacues, and hybrids. Each has a difficulty, description, practice
  notes, recommended BPM range, common uses, a skill-tree association, and a
  video link. Filterable by category **and** difficulty, with a live result count.
- **Expanded Groove Library** — 103 grooves across rock, blues, funk, jazz,
  metal, punk, latin, shuffle, and odd-meter. Filter by genre, difficulty, BPM
  range, and time signature, plus free-text search. Each groove lists its
  related rudiments.
- **Warmup Library** — 26 warmups across practice-pad, full-kit, speed,
  endurance, coordination, and timing, in 5 / 10 / 15 / 20-minute lengths. Each
  has a goal, difficulty, and step list. Filter by category and duration.
- **Practice Plans** — 11 multi-week plans spanning beginner → advanced. Plan
  tasks reference specific rudiments, grooves, and warmups, which render as deep
  links straight to that content.
- **Content relationships** — rudiment pages show related grooves / warmups /
  plans; groove pages show required rudiments, recommended warmups, and related
  plans; warmup pages show recommended rudiments. All cross-links are derived in
  code (`src/data/relationships.js`), not stored.
- **Global search** (`/search`) — one search box across rudiments, grooves,
  warmups, and plans; each result is tagged with its content type and links
  through. Reachable from the 🔍 action in the header.
- **Onboarding** (`/onboarding`) — three quick questions (experience level,
  primary goal, practice frequency) feed a **rules-based** (no AI) recommender
  that picks a starting plan and lands the user on it. New users are routed here
  automatically by `OnboardingGate` until the profile is set.
- **Smarter dashboard** — profile-aware recommended warmup / rudiment / groove,
  a continue-your-plan (or recommended-plan) card, current goals with progress
  bars, streak, and a recent-activity strip.

## Architecture shift — static content, user-only Firestore

The defining change in Phase 4: **catalog content is now static in code**, not
seeded into Firestore. All libraries live under `src/data/`:

```
src/data/rudiments/index.js       -> RUDIMENTS, getRudimentById, categories
src/data/grooves/index.js         -> GROOVES, getGrooveById, styles
src/data/warmups/index.js         -> WARMUPS, getWarmupById, categories, durations
src/data/practicePlans/index.js   -> PLANS, getPlanById, nextTask, countCompleted
src/data/relationships.js         -> cross-content lookups (pure functions)
src/data/recommendations.js       -> onboarding options + rules-based recommender
src/data/search.js                -> searchContent(query) across all 4 catalogs
```

Why: the spec's performance requirement is to avoid massive/duplicated Firestore
reads. Static content ships in the bundle, so browsing, filtering, searching,
and relationship lookups are **zero network reads**. Firestore now stores
**only user data** — progress, favorites, logs, plan progress, skill tree,
goals, and the profile.

The previous per-user seeded catalog documents (from earlier phases) are simply
no longer read. Content **ids were preserved**, so existing favorites and
rudiment progress still resolve against the static catalogs — no data migration
is required. The old seed module and `*Data.js` catalog files were removed.

### Onboarding storage

Onboarding answers are merged into the existing user document
`users/{uid}` (fields `experienceLevel`, `primaryGoal`, `practiceFrequency`,
`onboardedAt`) rather than a separate subcollection document. The user doc is
already read on load, so this adds **no extra read** and keeps "is this user
onboarded?" a single-field check (`!!profile.experienceLevel`).

```
users/{uid}  ->  { ...existing, experienceLevel, primaryGoal, practiceFrequency, onboardedAt }
```

---

## Manual actions

### 1. Firestore security rules — NO CHANGE REQUIRED ✅

The onboarding fields live on `users/{uid}`, which the owner already fully
controls, and **no new collections were added** (all new content is static). The
existing recursive rule covers everything. The full, current rules file is below
and in [`firestore.rules`](./firestore.rules) — deploy it only if you haven't
already:

- **Console:** Firebase console → **Build → Firestore Database → Rules** → paste
  → **Publish**.
- **CLI:** `firebase deploy --only firestore:rules`

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 2. Firestore indexes — NONE REQUIRED ✅

**Reason:** Phase 4 adds **no new Firestore queries**. All filtering, searching,
and relationship resolution runs **client-side over static `src/data/` content**
(plain array `filter`/`map`). The only reads are the existing single-document
profile read and the Phase 1–3 user-data reads, which use single-field `orderBy`
already covered by automatic single-field indexes. There are no
`where(...) + orderBy(...)` combinations, so no composite index is needed.

### 3. Environment variables — NO CHANGE REQUIRED ✅

No new services, keys, or APIs. The existing `VITE_FIREBASE_*` values are
unchanged. (Phase 4 has no AI / audio / microphone integrations by design.)

### 4. Vercel & PWA configuration — NO CHANGE REQUIRED ✅

The existing `vercel.json` SPA rewrite already serves the new client-side routes
(`/onboarding`, `/search`). Build command (`npm run build`) and output (`dist`)
are unchanged. `vite-plugin-pwa` regenerates the service-worker precache each
build; the larger static content is part of the JS bundle and is precached
automatically — no manifest/SW edits required.

---

## Performance notes

- **Catalog browsing is offline-capable and read-free** — rudiments, grooves,
  warmups, plans, search, and all cross-links resolve from in-bundle data.
- The dashboard loads its user-data sources in parallel with
  `Promise.allSettled`, so one slow/failed read never blocks the others, and
  recommendations are memoized (`useMemo`) against profile + progress.
- Content is static and tree-shake-friendly; relationship helpers are pure
  functions with no side effects.
- Trade-off: static content increases the JS bundle (Vite prints the usual
  Firebase chunk-size advisory). This is intentional — it trades a one-time
  cached download for zero per-interaction reads. If the catalogs grow much
  larger, split `src/data/*` into route-level dynamic `import()`s.

## Verify

```bash
npm install
npm run check   # lint + production build
npm run dev
```
