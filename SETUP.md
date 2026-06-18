# Drum Hub — Phase 1 Setup

This is the **Phase 1 foundation** of Drum Hub. The long-term product vision
lives in [README.md](./README.md) and is the source of truth for future work.
Phase 1 intentionally ships only the minimal foundation: authentication, the app
shell, a dashboard, manual practice-session tracking, and an MVP metronome.

## Run locally

```bash
npm install
npm run dev
```

The app boots even before Firebase is configured — you'll see the login screen
with a setup notice. Configure Firebase (below) to enable sign-in and data.

## Configure Firebase

1. Create a Firebase project and a Web App in the
   [Firebase console](https://console.firebase.google.com/).
2. Enable **Authentication → Sign-in method → Google** and **Email/Password**.
3. Create a **Firestore** database.
4. Copy `.env.example` to `.env` and fill in the values from
   _Project settings → Your apps → SDK setup and configuration_:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Restart `npm run dev` after editing `.env`.

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start the Vite dev server            |
| `npm run build`  | Production build (Vercel-ready)      |
| `npm run preview`| Preview the production build         |
| `npm run lint`   | Lint with ESLint                     |
| `npm run check`  | Lint + build                         |

## Deploy (Vercel)

The repo is Vercel-ready: framework preset **Vite**, build `npm run build`,
output `dist`. `vercel.json` rewrites all routes to `index.html` so client-side
routing and deep links work. Set the `VITE_FIREBASE_*` variables as Vercel
environment variables.

## Architecture

```
src/
  app/         App routes, shell layout, route guards
  components/  Shared presentational components (NavBar, Loader, …)
  pages/       One component per route
  features/    Self-contained feature modules
    auth/        Firebase auth context, service, hook
    sessions/    Practice session context, Firestore service, stats
    metronome/   useMetronome hook over the audio engine
  lib/
    firebase/    Centralized Firebase init (auth + firestore)
    audio/       Web Audio metronome engine (sample-accurate scheduler)
  hooks/       Shared hooks (e.g. useDocumentTitle)
  styles/      Global CSS (plain CSS, mobile-first, neon/HUD theme)
```

### Data model (Firestore)

```
users/{uid}                         -> { displayName, email, createdAt }
users/{uid}/practiceSessions/{id}   -> { startTime, endTime, durationSeconds, createdAt }
```

Future collections (rudiments, grooves, songs, etc.) slot in under `users/{uid}`
without restructuring.

## What's intentionally NOT in Phase 1

Rudiment/groove/song/warmup libraries, statistics, polyrhythm tools, and
advanced metronome features (swing, subdivisions, accents, tempo ramps, gap
training). The architecture is built to add these later without redesign.
```
