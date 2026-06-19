# Drum Hub — Phase 3 Notes

Phase 3 turns Drum Hub into a structured **training system**: it now answers
*what to practice, what you practiced, whether you're improving, and what comes
next*. All Phase 1 & 2 features are preserved.

## What shipped

- **Practice Statistics** (`/statistics`) — practice time (today/week/month/
  lifetime), session stats (total / average / longest), streaks (10-min/day
  rule), rudiment stats, and weekly/monthly bar charts (plain-CSS, no library).
- **Practice Logs** (`/practice-logs`) — after ending a session you're prompted
  "What did you work on today?"; notes + practiced items are saved and listed
  newest-first with **pagination** (load 10 at a time).
- **Practice Plans** (`/plans`, `/plans/:id`) — four built-in plans (Complete
  Beginner, Rudiment Builder, Speed Builder, Coordination Builder), each
  Weeks → Days → Tasks. Start a plan, check off tasks, see completion %.
- **Skill Tree** (`/skill-tree`) — Beginner/Intermediate/Advanced branches with
  Locked / Available / Completed states. Prerequisites unlock the next nodes;
  completion is user-controlled (no auto-evaluation).
- **Goals** (`/goals`) — create goals with a target, update progress manually,
  see a progress bar, mark complete.
- **Dashboard intelligence** — Continue-your-plan card (next task), suggested
  rudiment (least recently practiced) + warmup, and a Recent Activity strip
  (last session / last log / last rudiment).

Navigation: progression features live under a new **Progress** hub
(`/progress`), mirroring the Library hub. Settings moved to the header gear to
keep the bottom tab bar at five items.

## Data model (added in Phase 3)

```
users/{uid}/practiceLogs/{id}     -> { sessionId, notes, practicedItems[], durationSeconds, createdAt }
users/{uid}/practicePlans/{planId}-> { active, startedAt, completedTasks: { [taskId]: true } }
users/{uid}/skillTree/{nodeId}    -> { completed }
users/{uid}/goals/{id}            -> { title, type, targetValue, currentValue, completed, createdAt }
```

Plan and skill-tree **definitions** are static in code (`planData.js`,
`skillData.js`); Firestore stores only the user's progress. Nothing needs to be
seeded for Phase 3.

---

## Manual actions

### 1. Firestore security rules — NO CHANGE REQUIRED ✅

The existing rules already scope **all** of `users/{uid}/**` to the owner via a
recursive match, so the new subcollections (`practiceLogs`, `practicePlans`,
`skillTree`, `goals`) are covered automatically. For completeness, the full,
current rules file is below and in [`firestore.rules`](./firestore.rules).

If you have **not** yet deployed these rules (they were introduced in Phase 2),
deploy them now:

- **Console:** Firebase console → your project → **Build → Firestore Database →
  Rules** → paste the file → **Publish**.
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

**Reason:** every new query is either an unordered collection read or a
single-field `orderBy` (`practiceLogs` and `goals` by `createdAt`; `sessions` by
`startTime`). Single-field indexes are created automatically by Firestore, and
there are **no `where(...)+orderBy(...)` combinations**, so no composite indexes
are needed. (Practice-plan filtering and statistics are computed client-side.)

If you later add a composite query, Firestore will print a console link that
creates the exact index — follow that link and click **Create index**.

### 3. Environment variables — NO CHANGE REQUIRED ✅

No new services or keys. The existing `VITE_FIREBASE_*` values are unchanged.

### 4. Vercel configuration — NO CHANGE REQUIRED ✅

The existing `vercel.json` SPA rewrite already serves the new client-side routes
(`/statistics`, `/plans`, `/plans/:id`, `/practice-logs`, `/skill-tree`,
`/goals`, `/progress`). Build command (`npm run build`) and output (`dist`) are
unchanged. `vite-plugin-pwa` regenerates the service-worker precache on each
build, so no manifest/SW edits are required.

---

## Performance notes

- Practice logs are **paginated** (`limit` + `startAfter`), so history never
  loads all at once.
- Statistics reads all sessions in one query (modest per-user volume); if it
  grows, switch `getAllSessions` to a date-bounded query.
- The dashboard loads its data sources in parallel with `Promise.allSettled`, so
  one slow/failed read never blocks the others.

## Verify

```bash
npm install
npm run check   # lint + production build
npm run dev
```
