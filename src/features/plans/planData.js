/**
 * Built-in practice plans (static). A plan is Weeks → Days → Tasks. Each week
 * defines a theme and a set of daily tasks; the builder repeats those tasks
 * across the week's practice days, giving every task a stable id
 * (`w{week}d{day}t{n}`) so per-day completion can be tracked in Firestore.
 *
 * User progress (which tasks are done, which plan is active) lives in
 * `users/{uid}/practicePlans/{planId}` — see planService.
 */
function buildPlan({ id, name, durationLabel, summary, focus, daysPerWeek, weeks }) {
  const builtWeeks = weeks.map((wk, wi) => ({
    week: wi + 1,
    title: wk.title,
    days: Array.from({ length: daysPerWeek }, (_, di) => ({
      day: di + 1,
      tasks: wk.tasks.map((t, ti) => ({
        id: `w${wi + 1}d${di + 1}t${ti + 1}`,
        label: t.label,
        minutes: t.minutes
      }))
    }))
  }))
  const totalTasks = builtWeeks.reduce(
    (n, w) => n + w.days.reduce((m, d) => m + d.tasks.length, 0),
    0
  )
  return { id, name, durationLabel, summary, focus, daysPerWeek, weeks: builtWeeks, totalTasks }
}

export const PLANS = [
  buildPlan({
    id: 'complete-beginner',
    name: 'Complete Beginner',
    durationLabel: '30 Days',
    summary: 'Your first month behind the kit: stick control, timing, and your first beats.',
    focus: ['Singles', 'Doubles', 'Basic Timing', 'Basic Rock Beats'],
    daysPerWeek: 5,
    weeks: [
      {
        title: 'Singles & Timing',
        tasks: [
          { label: 'Single strokes to a metronome', minutes: 10 },
          { label: 'Quarter-note timing along with a click', minutes: 10 },
          { label: 'Relaxed grip check + slow singles', minutes: 5 }
        ]
      },
      {
        title: 'Doubles',
        tasks: [
          { label: 'Double stroke roll, slow and even', minutes: 10 },
          { label: 'Singles vs doubles alternating bars', minutes: 10 },
          { label: 'Eighth-note timing exercise', minutes: 10 }
        ]
      },
      {
        title: 'Basic Rock Beats',
        tasks: [
          { label: 'Basic rock beat (kick 1 & 3, snare 2 & 4)', minutes: 10 },
          { label: 'Add eighth-note hi-hats', minutes: 10 },
          { label: 'Play along to a simple song', minutes: 10 }
        ]
      },
      {
        title: 'Putting It Together',
        tasks: [
          { label: 'Warmup: singles & doubles', minutes: 5 },
          { label: 'Rock beat with simple fills', minutes: 10 },
          { label: 'Free practice / review', minutes: 10 }
        ]
      }
    ]
  }),
  buildPlan({
    id: 'rudiment-builder',
    name: 'Rudiment Builder',
    durationLabel: '6 Weeks',
    summary: 'Develop the core rudiment vocabulary every drummer needs.',
    focus: ['Paradiddles', 'Flams', 'Drags', 'Rolls'],
    daysPerWeek: 4,
    weeks: [
      {
        title: 'Singles & Doubles Foundation',
        tasks: [
          { label: 'Single stroke roll, build tempo', minutes: 10 },
          { label: 'Double stroke roll control', minutes: 10 }
        ]
      },
      {
        title: 'Paradiddles',
        tasks: [
          { label: 'Single paradiddle with accents', minutes: 10 },
          { label: 'Paradiddles around the kit', minutes: 10 }
        ]
      },
      {
        title: 'Double Paradiddles',
        tasks: [
          { label: 'Double paradiddle, triplet feel', minutes: 10 },
          { label: 'Paradiddle-diddle fills', minutes: 10 }
        ]
      },
      {
        title: 'Flams',
        tasks: [
          { label: 'Flam, grace-note control', minutes: 10 },
          { label: 'Flam tap & flam accent', minutes: 10 }
        ]
      },
      {
        title: 'Drags',
        tasks: [
          { label: 'Drag (ruff) control', minutes: 10 },
          { label: 'Drag paradiddle #1', minutes: 10 }
        ]
      },
      {
        title: 'Rolls & Review',
        tasks: [
          { label: 'Five & nine stroke rolls', minutes: 10 },
          { label: 'Review all rudiments at tempo', minutes: 10 }
        ]
      }
    ]
  }),
  buildPlan({
    id: 'speed-builder',
    name: 'Speed Builder',
    durationLabel: '8 Weeks',
    summary: 'Systematically raise your hand speed, endurance, and top tempo.',
    focus: ['Hand Speed', 'Endurance', 'Tempo Development'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Baseline & Form', tasks: [
        { label: 'Find clean max single-stroke tempo', minutes: 10 },
        { label: 'Long slow singles (endurance)', minutes: 10 }
      ] },
      { title: 'Tempo Ladders', tasks: [
        { label: 'Singles +5 BPM ladder', minutes: 10 },
        { label: 'Doubles +5 BPM ladder', minutes: 10 }
      ] },
      { title: 'Endurance', tasks: [
        { label: 'Sustained singles 3+ minutes', minutes: 10 },
        { label: 'Accent patterns at moderate tempo', minutes: 10 }
      ] },
      { title: 'Burst Training', tasks: [
        { label: 'Short fast bursts, full relaxation between', minutes: 10 },
        { label: 'Paradiddle speed bursts', minutes: 10 }
      ] },
      { title: 'Doubles Focus', tasks: [
        { label: 'Open–closed double stroke technique', minutes: 10 },
        { label: 'Double stroke tempo ladder', minutes: 10 }
      ] },
      { title: 'Mixed Subdivisions', tasks: [
        { label: 'Eighths → triplets → sixteenths', minutes: 10 },
        { label: 'Pyramid up and down', minutes: 10 }
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
    id: 'coordination-builder',
    name: 'Coordination Builder',
    durationLabel: '6 Weeks',
    summary: 'Tighten four-limb independence and groove control.',
    focus: ['Limb Independence', 'Groove Control'],
    daysPerWeek: 4,
    weeks: [
      { title: 'Hands & Feet Unison', tasks: [
        { label: 'Hands + kick in unison', minutes: 10 },
        { label: 'Steady hat foot on 2 & 4', minutes: 10 }
      ] },
      { title: 'Kick Independence', tasks: [
        { label: 'Vary kick under steady hands', minutes: 10 },
        { label: 'Sixteenth-note kick placements', minutes: 10 }
      ] },
      { title: 'Hi-Hat Independence', tasks: [
        { label: 'Move hats off the downbeat', minutes: 10 },
        { label: 'Open hi-hat accents', minutes: 10 }
      ] },
      { title: 'Ghost Notes', tasks: [
        { label: 'Snare ghost notes under backbeat', minutes: 10 },
        { label: 'Funk groove with ghosts', minutes: 10 }
      ] },
      { title: 'Linear Phrasing', tasks: [
        { label: 'Simple linear hand/foot patterns', minutes: 10 },
        { label: 'Linear fills', minutes: 10 }
      ] },
      { title: 'Groove Control & Review', tasks: [
        { label: 'Shuffle groove coordination', minutes: 10 },
        { label: 'Play grooves at varied tempos', minutes: 10 }
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
  return null // plan complete
}

export function countCompleted(plan, completedTasks = {}) {
  let n = 0
  for (const week of plan.weeks)
    for (const day of week.days)
      for (const task of day.tasks) if (completedTasks[task.id]) n++
  return n
}
