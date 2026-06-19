/**
 * Built-in practice plans (STATIC). Weeks → Days → Tasks. Tasks may reference a
 * rudiment / groove / warmup via `ref: { type, id }`, which the UI turns into a
 * link and which powers "related plans" relationships.
 *
 * Only user progress (completed tasks, active plan) is stored in Firestore.
 */
export const PLAN_LEVELS = ['beginner', 'intermediate', 'advanced']

function buildPlan({ id, name, level, durationLabel, summary, focus, tags = [], daysPerWeek, weeks }) {
  const builtWeeks = weeks.map((wk, wi) => ({
    week: wi + 1,
    title: wk.title,
    days: Array.from({ length: daysPerWeek }, (_, di) => ({
      day: di + 1,
      tasks: wk.tasks.map((t, ti) => ({
        id: `w${wi + 1}d${di + 1}t${ti + 1}`,
        label: t.label,
        minutes: t.minutes,
        ref: t.ref || null
      }))
    }))
  }))
  const totalTasks = builtWeeks.reduce(
    (n, w) => n + w.days.reduce((m, d) => m + d.tasks.length, 0),
    0
  )
  return { id, name, level, durationLabel, summary, focus, tags, daysPerWeek, weeks: builtWeeks, totalTasks }
}

const ref = (type, id) => ({ type, id })

export const PLANS = [
  // ===================== Beginner =====================
  buildPlan({
    id: 'complete-beginner',
    name: 'First 30 Days',
    level: 'beginner',
    durationLabel: '30 Days',
    summary: 'Your first month behind the kit: stick control, timing, and your first beats.',
    focus: ['Singles', 'Doubles', 'Basic Timing', 'Basic Rock Beats'],
    tags: ['basics', 'rock', 'timing'],
    daysPerWeek: 5,
    weeks: [
      { title: 'Singles & Timing', tasks: [
        { label: 'Single stroke roll to a metronome', minutes: 10, ref: ref('rudiment', 'single-stroke-roll') },
        { label: 'Lock to the click', minutes: 5, ref: ref('warmup', 'timing-click-lock') },
        { label: 'Quarter-note timing', minutes: 10 }
      ] },
      { title: 'Doubles', tasks: [
        { label: 'Double stroke roll, slow & even', minutes: 10, ref: ref('rudiment', 'double-stroke-roll') },
        { label: 'Singles vs doubles alternating', minutes: 10 },
        { label: '5-minute pad warmup', minutes: 5, ref: ref('warmup', 'five-min-pad-warmup') }
      ] },
      { title: 'Basic Rock Beats', tasks: [
        { label: 'Basic rock beat', minutes: 10, ref: ref('groove', 'basic-rock-beat') },
        { label: 'Add eighth-note hats', minutes: 10, ref: ref('groove', 'eighth-note-rock') },
        { label: 'Play along to a simple song', minutes: 10 }
      ] },
      { title: 'Putting It Together', tasks: [
        { label: 'Full-kit flow warmup', minutes: 10, ref: ref('warmup', 'full-kit-flow') },
        { label: 'Rock beat with simple fills', minutes: 10, ref: ref('groove', 'basic-rock-beat') },
        { label: 'Free practice / review', minutes: 10 }
      ] }
    ]
  }),
  buildPlan({
    id: 'learn-your-first-groove',
    name: 'Learn Your First Groove',
    level: 'beginner',
    durationLabel: '2 Weeks',
    summary: 'Go from zero to confidently playing a solid rock beat.',
    focus: ['Rock Beat', 'Coordination', 'Timing'],
    tags: ['rock', 'grooves', 'basics'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Hands & Feet', tasks: [
        { label: 'Quarter-note rock (hats + kick)', minutes: 10, ref: ref('groove', 'quarter-note-rock') },
        { label: 'Beginner coordination warmup', minutes: 10, ref: ref('warmup', 'beginner-coordination-warmup') }
      ] },
      { title: 'The Full Beat', tasks: [
        { label: 'Basic rock beat', minutes: 10, ref: ref('groove', 'basic-rock-beat') },
        { label: 'Driving eighth rock', minutes: 10, ref: ref('groove', 'eighth-note-rock') }
      ] }
    ]
  }),
  buildPlan({
    id: 'rudiment-builder',
    name: 'Rudiment Foundations',
    level: 'beginner',
    durationLabel: '6 Weeks',
    summary: 'Develop the core rudiment vocabulary every drummer needs.',
    focus: ['Paradiddles', 'Flams', 'Drags', 'Rolls'],
    tags: ['rudiments'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Singles & Doubles', tasks: [
        { label: 'Single stroke roll', minutes: 10, ref: ref('rudiment', 'single-stroke-roll') },
        { label: 'Double stroke roll', minutes: 10, ref: ref('rudiment', 'double-stroke-roll') }
      ] },
      { title: 'Paradiddles', tasks: [
        { label: 'Single paradiddle with accents', minutes: 10, ref: ref('rudiment', 'single-paradiddle') },
        { label: 'Paradiddles around the kit', minutes: 10 }
      ] },
      { title: 'Double Paradiddles', tasks: [
        { label: 'Double paradiddle', minutes: 10, ref: ref('rudiment', 'double-paradiddle') },
        { label: 'Paradiddle-diddle', minutes: 10, ref: ref('rudiment', 'paradiddle-diddle') }
      ] },
      { title: 'Flams', tasks: [
        { label: 'Flam control', minutes: 10, ref: ref('rudiment', 'single-flam') },
        { label: 'Flam tap & flam accent', minutes: 10, ref: ref('rudiment', 'flam-tap') }
      ] },
      { title: 'Drags', tasks: [
        { label: 'Drag control', minutes: 10, ref: ref('rudiment', 'single-drag') },
        { label: 'Single drag tap', minutes: 10, ref: ref('rudiment', 'single-drag-tap') }
      ] },
      { title: 'Rolls & Review', tasks: [
        { label: 'Five & nine stroke rolls', minutes: 10, ref: ref('rudiment', 'five-stroke-roll') },
        { label: 'Rudiment rotation warmup', minutes: 10, ref: ref('warmup', 'pad-rudiment-rotation') }
      ] }
    ]
  }),

  // ===================== Intermediate =====================
  buildPlan({
    id: 'groove-builder',
    name: 'Groove Builder',
    level: 'intermediate',
    durationLabel: '6 Weeks',
    summary: 'Expand your groove vocabulary across rock, funk, and blues.',
    focus: ['Funk', 'Blues', 'Ghost Notes', 'Pocket'],
    tags: ['grooves', 'funk', 'blues', 'rock'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Sixteenth Rock', tasks: [
        { label: 'Sixteenth hi-hat rock', minutes: 10, ref: ref('groove', 'sixteenth-hat-rock') },
        { label: 'Full-kit dynamics', minutes: 10, ref: ref('warmup', 'full-kit-dynamics') }
      ] },
      { title: 'Funk Pocket', tasks: [
        { label: 'Sixteenth funk groove', minutes: 10, ref: ref('groove', 'funk-sixteenth-groove') },
        { label: 'Deep pocket funk', minutes: 10, ref: ref('groove', 'funk-pocket') }
      ] },
      { title: 'Ghost Notes', tasks: [
        { label: 'Ghost-note funk', minutes: 10, ref: ref('groove', 'funk-ghost-groove') },
        { label: 'Ghost note coordination', minutes: 10, ref: ref('warmup', 'ghost-note-coordination') }
      ] },
      { title: 'Blues Feel', tasks: [
        { label: 'Blues shuffle', minutes: 10, ref: ref('groove', 'blues-shuffle') },
        { label: 'Slow blues 12/8', minutes: 10, ref: ref('groove', 'slow-blues-12-8') }
      ] },
      { title: 'Half-Time', tasks: [
        { label: 'Half-time funk', minutes: 10, ref: ref('groove', 'half-time-funk') },
        { label: 'Half-time rock', minutes: 10, ref: ref('groove', 'half-time-rock') }
      ] },
      { title: 'Apply It', tasks: [
        { label: 'Groove tour warmup', minutes: 15, ref: ref('warmup', 'full-kit-groove-tour') },
        { label: 'Play grooves with a song', minutes: 10 }
      ] }
    ]
  }),
  buildPlan({
    id: 'coordination-builder',
    name: 'Coordination Builder',
    level: 'intermediate',
    durationLabel: '6 Weeks',
    summary: 'Tighten four-limb independence and groove control.',
    focus: ['Limb Independence', 'Groove Control'],
    tags: ['coordination', 'grooves'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Hands & Feet Unison', tasks: [
        { label: 'Hand & foot coordination', minutes: 10, ref: ref('warmup', 'hand-foot-coordination') },
        { label: 'Steady hat foot on 2 & 4', minutes: 10 }
      ] },
      { title: 'Kick Independence', tasks: [
        { label: 'Vary the kick under steady hands', minutes: 10 },
        { label: 'Sixteenth-note kick placements', minutes: 10 }
      ] },
      { title: 'Hi-Hat Independence', tasks: [
        { label: 'Move hats off the downbeat', minutes: 10 },
        { label: 'Open hi-hat accents', minutes: 10 }
      ] },
      { title: 'Ghost Notes', tasks: [
        { label: 'Ghost note coordination', minutes: 10, ref: ref('warmup', 'ghost-note-coordination') },
        { label: 'Funk groove with ghosts', minutes: 10, ref: ref('groove', 'funk-ghost-groove') }
      ] },
      { title: 'Ostinatos', tasks: [
        { label: 'Ostinato independence', minutes: 15, ref: ref('warmup', 'independence-ostinato') },
        { label: 'Improvise over a foot pattern', minutes: 10 }
      ] },
      { title: 'Groove Control', tasks: [
        { label: 'Half-time shuffle', minutes: 10, ref: ref('groove', 'half-time-shuffle') },
        { label: 'Play grooves at varied tempos', minutes: 10 }
      ] }
    ]
  }),
  buildPlan({
    id: 'speed-builder',
    name: 'Speed Builder',
    level: 'intermediate',
    durationLabel: '8 Weeks',
    summary: 'Systematically raise your hand speed, endurance, and top tempo.',
    focus: ['Hand Speed', 'Endurance', 'Tempo Development'],
    tags: ['speed', 'rudiments'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Baseline & Form', tasks: [
        { label: 'Find clean max single tempo', minutes: 10, ref: ref('rudiment', 'single-stroke-roll') },
        { label: 'Single stroke endurance', minutes: 10, ref: ref('warmup', 'endurance-singles') }
      ] },
      { title: 'Tempo Ladders', tasks: [
        { label: 'Speed builder warmup', minutes: 10, ref: ref('warmup', 'speed-builder-warmup') },
        { label: 'Doubles +5 BPM ladder', minutes: 10, ref: ref('rudiment', 'double-stroke-roll') }
      ] },
      { title: 'Endurance', tasks: [
        { label: 'Sustained singles 3+ minutes', minutes: 10 },
        { label: 'Accent stamina', minutes: 10, ref: ref('warmup', 'endurance-accent-stamina') }
      ] },
      { title: 'Burst Training', tasks: [
        { label: 'Speed bursts', minutes: 10, ref: ref('warmup', 'speed-bursts') },
        { label: 'Paradiddle speed bursts', minutes: 10, ref: ref('rudiment', 'single-paradiddle') }
      ] },
      { title: 'Doubles Focus', tasks: [
        { label: 'Double stroke speed', minutes: 15, ref: ref('warmup', 'double-stroke-speed') },
        { label: 'Open–closed technique', minutes: 10 }
      ] },
      { title: 'Mixed Subdivisions', tasks: [
        { label: 'Single stroke pyramid', minutes: 10, ref: ref('warmup', 'single-stroke-pyramid') },
        { label: 'Eighths → triplets → sixteenths', minutes: 10 }
      ] },
      { title: 'Push the Ceiling', tasks: [
        { label: 'New max attempt + back off 10 BPM', minutes: 10 },
        { label: 'Endurance at 80% max', minutes: 10 }
      ] },
      { title: 'Consolidate', tasks: [
        { label: 'Retest clean max tempo', minutes: 10 },
        { label: 'Apply speed to a groove/fill', minutes: 10 }
      ] }
    ]
  }),
  buildPlan({
    id: 'shuffle-mastery',
    name: 'Shuffle Mastery',
    level: 'intermediate',
    durationLabel: '4 Weeks',
    summary: 'Own the triplet feel from basic shuffles to the half-time shuffle.',
    focus: ['Shuffle', 'Triplets', 'Ghost Notes'],
    tags: ['shuffle', 'blues', 'grooves'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Triplet Feel', tasks: [
        { label: 'Slow shuffle', minutes: 10, ref: ref('groove', 'slow-shuffle') },
        { label: 'Basic shuffle', minutes: 10, ref: ref('groove', 'basic-shuffle') }
      ] },
      { title: 'Blues Shuffle', tasks: [
        { label: 'Blues shuffle', minutes: 10, ref: ref('groove', 'blues-shuffle') },
        { label: 'Double stroke roll control', minutes: 10, ref: ref('rudiment', 'double-stroke-roll') }
      ] },
      { title: 'Driving Shuffle', tasks: [
        { label: 'Texas shuffle', minutes: 10, ref: ref('groove', 'texas-shuffle') },
        { label: 'Rock shuffle', minutes: 10, ref: ref('groove', 'rock-shuffle') }
      ] },
      { title: 'Half-Time Shuffle', tasks: [
        { label: 'Half-time shuffle', minutes: 10, ref: ref('groove', 'half-time-shuffle') },
        { label: 'Shuffle funk', minutes: 10, ref: ref('groove', 'shuffle-funk') }
      ] }
    ]
  }),

  // ===================== Advanced =====================
  buildPlan({
    id: 'odd-time-foundations',
    name: 'Odd Time Foundations',
    level: 'advanced',
    durationLabel: '6 Weeks',
    summary: 'Get comfortable grooving and counting in odd meters.',
    focus: ['5/4', '7/8', 'Odd Meter Grooves'],
    tags: ['odd-meter', 'grooves'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Counting in 5', tasks: [
        { label: '5/4 groove (3+2)', minutes: 10, ref: ref('groove', 'five-four-groove') },
        { label: 'Subdivision timing', minutes: 10, ref: ref('warmup', 'timing-subdivision') }
      ] },
      { title: 'Grooving in 7', tasks: [
        { label: '7/8 groove (2+2+3)', minutes: 10, ref: ref('groove', 'seven-eight-groove') },
        { label: '7/4 groove', minutes: 10, ref: ref('groove', 'seven-four-groove') }
      ] },
      { title: 'Compound Odd', tasks: [
        { label: '9/8 groove', minutes: 10, ref: ref('groove', 'nine-eight-groove') },
        { label: '5/8 groove', minutes: 10, ref: ref('groove', 'five-eight-groove') }
      ] },
      { title: 'Prog Feels', tasks: [
        { label: 'Prog rock in 7', minutes: 10, ref: ref('groove', 'odd-meter-rock') },
        { label: 'Math rock groove', minutes: 10, ref: ref('groove', 'math-rock-groove') }
      ] },
      { title: 'Bigger Cycles', tasks: [
        { label: '11/8 groove', minutes: 10, ref: ref('groove', 'eleven-eight-groove') },
        { label: '6/4 groove', minutes: 10, ref: ref('groove', 'six-four-groove') }
      ] },
      { title: 'Apply & Improvise', tasks: [
        { label: 'Fills within an odd cycle', minutes: 10 },
        { label: 'Trade bars in 5 and 7', minutes: 10 }
      ] }
    ]
  }),
  buildPlan({
    id: 'linear-groove-development',
    name: 'Linear Groove Development',
    level: 'advanced',
    durationLabel: '6 Weeks',
    summary: 'Build flowing linear grooves where no two limbs strike together.',
    focus: ['Linear Phrasing', 'Funk', 'Independence'],
    tags: ['funk', 'coordination', 'grooves'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Linear Basics', tasks: [
        { label: 'Linear funk', minutes: 10, ref: ref('groove', 'linear-funk') },
        { label: 'Paradiddle-diddle', minutes: 10, ref: ref('rudiment', 'paradiddle-diddle') }
      ] },
      { title: 'Three-Note Cells', tasks: [
        { label: 'RLK / RLF linear cells', minutes: 10 },
        { label: 'Ostinato independence', minutes: 10, ref: ref('warmup', 'independence-ostinato') }
      ] },
      { title: 'New Orleans Feel', tasks: [
        { label: 'New Orleans second line', minutes: 10, ref: ref('groove', 'new-orleans-funk') },
        { label: 'Go-go groove', minutes: 10, ref: ref('groove', 'go-go-groove') }
      ] },
      { title: 'Linear Fills', tasks: [
        { label: 'Linear fills around the kit', minutes: 10 },
        { label: 'Fill vocabulary warmup', minutes: 10, ref: ref('warmup', 'full-kit-fills') }
      ] },
      { title: 'Afrobeat & Songo', tasks: [
        { label: 'Afrobeat', minutes: 10, ref: ref('groove', 'afrobeat') },
        { label: 'Songo', minutes: 10, ref: ref('groove', 'songo') }
      ] },
      { title: 'Compose a Groove', tasks: [
        { label: 'Write your own linear groove', minutes: 15 },
        { label: 'Play it with a track', minutes: 10 }
      ] }
    ]
  }),
  buildPlan({
    id: 'advanced-rudiment-mastery',
    name: 'Advanced Rudiment Mastery',
    level: 'advanced',
    durationLabel: '8 Weeks',
    summary: 'Master flams, drags, ratamacues, and hybrid rudiments.',
    focus: ['Flams', 'Drags', 'Ratamacues', 'Hybrids'],
    tags: ['rudiments'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Flam Family', tasks: [
        { label: 'Flamacue', minutes: 10, ref: ref('rudiment', 'flamacue') },
        { label: 'Flam paradiddle', minutes: 10, ref: ref('rudiment', 'flam-paradiddle') }
      ] },
      { title: 'Inverted Flams', tasks: [
        { label: 'Inverted flam tap', minutes: 10, ref: ref('rudiment', 'inverted-flam-tap') },
        { label: 'Flam paradiddle-diddle', minutes: 10, ref: ref('rudiment', 'flam-paradiddle-diddle') }
      ] },
      { title: 'Drag Family', tasks: [
        { label: 'Single & double drag tap', minutes: 10, ref: ref('rudiment', 'double-drag-tap') },
        { label: 'Single dragadiddle', minutes: 10, ref: ref('rudiment', 'single-dragadiddle') }
      ] },
      { title: 'Drag Paradiddles', tasks: [
        { label: 'Drag paradiddle #1', minutes: 10, ref: ref('rudiment', 'drag-paradiddle-1') },
        { label: 'Drag paradiddle #2', minutes: 10, ref: ref('rudiment', 'drag-paradiddle-2') }
      ] },
      { title: 'Ratamacues', tasks: [
        { label: 'Single ratamacue', minutes: 10, ref: ref('rudiment', 'single-ratamacue') },
        { label: 'Double ratamacue', minutes: 10, ref: ref('rudiment', 'double-ratamacue') }
      ] },
      { title: 'Triple Ratamacue', tasks: [
        { label: 'Triple ratamacue', minutes: 10, ref: ref('rudiment', 'triple-ratamacue') },
        { label: 'Rudiment rotation', minutes: 10, ref: ref('warmup', 'pad-rudiment-rotation') }
      ] },
      { title: 'Hybrids', tasks: [
        { label: 'Swiss army triplet', minutes: 10, ref: ref('rudiment', 'swiss-army-triplet') },
        { label: 'Pataflafla', minutes: 10, ref: ref('rudiment', 'pataflafla') }
      ] },
      { title: 'Apply to the Kit', tasks: [
        { label: 'Orchestrate rudiments as fills', minutes: 10 },
        { label: 'Flam drag around the toms', minutes: 10, ref: ref('rudiment', 'flam-drag') }
      ] }
    ]
  }),
  buildPlan({
    id: 'endurance-program',
    name: 'Endurance Program',
    level: 'advanced',
    durationLabel: '6 Weeks',
    summary: 'Build the stamina to play hard for a full set.',
    focus: ['Endurance', 'Stamina', 'Double Bass'],
    tags: ['endurance', 'speed'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Hand Stamina', tasks: [
        { label: 'Single stroke endurance', minutes: 10, ref: ref('warmup', 'endurance-singles') },
        { label: 'Accent stamina', minutes: 10, ref: ref('warmup', 'endurance-accent-stamina') }
      ] },
      { title: 'Groove Endurance', tasks: [
        { label: 'Groove endurance hold', minutes: 20, ref: ref('warmup', 'endurance-groove-hold') }
      ] },
      { title: 'Foot Stamina', tasks: [
        { label: 'Double bass endurance', minutes: 15, ref: ref('warmup', 'endurance-double-bass') },
        { label: 'Double bass metal groove', minutes: 10, ref: ref('groove', 'double-bass-metal') }
      ] },
      { title: 'Fast & Long', tasks: [
        { label: 'Thrash beat hold', minutes: 10, ref: ref('groove', 'thrash-beat') },
        { label: 'Sustained singles at tempo', minutes: 10 }
      ] },
      { title: 'Sets', tasks: [
        { label: 'Play three songs back to back', minutes: 15 },
        { label: 'Recovery + technique check', minutes: 10 }
      ] },
      { title: 'Peak', tasks: [
        { label: 'Full-length set simulation', minutes: 20 },
        { label: 'Cool down and stretch', minutes: 5 }
      ] }
    ]
  })
]

export function getPlanById(id) {
  return PLANS.find((p) => p.id === id) ?? null
}

/** Walk a plan's tasks in order; return the first not marked complete. */
export function nextTask(plan, completedTasks = {}) {
  for (const week of plan.weeks) {
    for (const day of week.days) {
      for (const task of day.tasks) {
        if (!completedTasks[task.id]) {
          return { week: week.week, day: day.day, task }
        }
      }
    }
  }
  return null
}

export function countCompleted(plan, completedTasks = {}) {
  let n = 0
  for (const week of plan.weeks)
    for (const day of week.days)
      for (const task of day.tasks) if (completedTasks[task.id]) n++
  return n
}
