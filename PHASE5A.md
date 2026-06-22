# Drum Hub — Phase 5A Notes

Phase 5A turns the basic metronome into a **professional-grade timing & rhythm
training tool** and lays the foundation for a **Training Center**. It is purely
additive: the original metronome behavior is preserved exactly, and no unrelated
system was touched.

## What shipped

### Advanced Metronome (extended, not replaced)

The existing `MetronomeEngine` (Web Audio "two clocks" lookahead scheduler) was
**extended in place** to schedule per *subdivision step* instead of per *beat*.
With the defaults (`subdivision = quarter`, no swing, accent beat 1) it produces
**byte-for-byte the original click pattern and timing**, so existing callers are
unaffected. New capabilities:

- **Subdivisions** — Quarter / Eighth / Triplet / Sixteenth. Affects both click
  timing (a softer, higher tick on off-steps) and the visual display.
- **Swing** — Straight / Light / Medium / Heavy. Applied **only to straight
  eighth notes** (musically valid). Implemented by lengthening the on-beat and
  shortening the off-beat by the same fraction of a beat — timing stays
  drift-free because every step duration is still added onto the audio clock.
- **Accent patterns** — All beats / Beat 1 / 1+3 / 2+4 / Custom. Custom shows a
  tappable per-beat grid and stores a `boolean[]`.
- **Gap training** — *X bars audible, Y bars silent*. The scheduler keeps
  running through silent bars (no drift); only the audio is muted.
- **Random mute** — Off / Low / Med / High. Whole measures are muted at random.
  **Deterministic per session**: a per-run seed hashed with the bar index gives a
  stable, reproducible result without storing per-bar state. Bar 0 is never muted.
- **Tempo ramp** — Start BPM → End BPM over N minutes. BPM is lerped from elapsed
  *audio-clock* time, so the ramp is smooth and drift-free; the big readout shows
  the live BPM while playing.

### Metronome Presets

Save/load/rename/delete full configurations. Built-in **starters**: Practice
Pad, Jazz Swing Time, Speed Builder, Odd Meter Drill (7/8). Applying a preset is
instant (local state + engine update).

### Training Center (`/training`)

Hub page. **Active:** Subdivision Trainer. **Coming soon (placeholders only,
no logic):** Tempo Challenge, Stick Control Trainer, Practice Pad Mode,
Independence Trainer, Polyrhythm Trainer, Reading Drills.

### Subdivision Trainer (`/training/subdivisions`)

Reuses the **same** metronome engine — no second timing system. Modes: **Fixed**
(one subdivision), **Alternating** (cycles Q→E→T→S every 1/2/4 bars),
**Random** (jumps unpredictably). Large read-aloud count display
(`1 2 3 4` → `1 & 2 &` → `1 trip let` → `1 e & a`). Mode switches are driven off
the engine's reported **bar boundaries**, so the trainer never runs its own clock.

### Dashboard integration

New **Training** section: recent preset (loads straight into the metronome),
continue-subdivision-trainer card, and quick-launch buttons for Metronome,
Subdivision Trainer, and Training Center. A **Train** tab was added to the nav.

## Architecture

```
src/lib/audio/metronomeEngine.js          -> extended: subdivision/swing/accents/
                                             gap/random-mute/ramp (+ seeded PRNG)
src/features/metronome/metronomeConfig.js  -> options, defaults, helpers, examples
src/features/metronome/useMetronome.js     -> config-driven hook (page + trainer)
src/features/metronome/presetService.js    -> users/{uid}/metronomePresets CRUD
src/features/metronome/trainingService.js  -> users/{uid}/trainingProgress/subdivisions
src/components/metronome/AccentEditor.jsx  -> accent modes + custom grid
src/components/metronome/PresetBar.jsx     -> save/load/rename/delete + starters
src/pages/MetronomePage.jsx                -> advanced controls + presets
src/pages/TrainingCenterPage.jsx           -> /training hub
src/pages/SubdivisionTrainerPage.jsx       -> /training/subdivisions
```

### Firestore shapes (user-only, matching Phase 4 philosophy)

```
users/{uid}/metronomePresets/{presetId}
  name, bpm, timeSignature, beatsPerMeasure, subdivision, swing,
  accentMode, accentPattern[], gapTraining{}, randomMute, tempoRamp{}, createdAt

users/{uid}/trainingProgress/subdivisions   (single document)
  lastMode, lastSubdivision, totalSessions, totalTimeSeconds, updatedAt
```

---

## Manual actions

### 1. Firestore security rules — NO CHANGE REQUIRED ✅

Both new paths live **under `users/{uid}/…`**, already covered by the existing
recursive owner rule (`match /{document=**}`). No new top-level collections were
added. The full, current rules file is unchanged and reproduced below — deploy
only if you haven't already:

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

- **Console:** Firebase console → **Build → Firestore Database → Rules** → paste → **Publish**.
- **CLI:** `firebase deploy --only firestore:rules`

### 2. Firestore indexes — NONE REQUIRED ✅

**Reason:** the only new query is `metronomePresets orderBy('createdAt','desc')`,
a **single-field** order covered by Firestore's automatic single-field indexes.
`trainingProgress/subdivisions` is a single-document read. There are no
`where(...) + orderBy(...)` combinations, so no composite index is needed.

### 3. Environment variables — NO CHANGE REQUIRED ✅

No new services or keys. No AI, no microphone, no audio analysis, no external
timing libraries — timing uses the existing Web Audio scheduler.

### 4. Vercel / PWA — NO CHANGE REQUIRED ✅

The existing SPA rewrite serves the new client routes (`/training`,
`/training/subdivisions`). Build command (`npm run build`) and output (`dist`)
are unchanged; `vite-plugin-pwa` re-precaches automatically each build. No cache
clearing required beyond a normal redeploy.

---

## Performance & correctness

- **One timing engine.** Both the metronome and the trainer share
  `MetronomeEngine`; there is no duplicate scheduler.
- **No drift.** Every event (including swing, ramp, and silent bars) advances the
  next-note time on the audio clock; setTimeout is used only for the coarse
  lookahead and visual callbacks, never for audio timing.
- **No rerender-heavy loops.** The engine runs outside React; only the lightweight
  `beatInfo` snapshot crosses into state for visuals.
- **Efficient reads.** Presets and trainer progress load once (in parallel with
  the dashboard's existing `Promise.allSettled`); totals use atomic `increment()`.

## Verify

```bash
npm install
npm run check   # lint + production build (passes)
npm run dev
```
