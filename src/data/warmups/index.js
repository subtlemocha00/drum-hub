/**
 * Warmup library — short structured routines. STATIC content (no Firestore).
 *
 * Fields: id, name/title, category, difficulty, durationMinutes, goal,
 * description, steps[] (plain text), relatedRudiments[]. `focus` mirrors
 * `category` for backward compatibility.
 */
export const WARMUP_CATEGORIES = ['practice-pad', 'full-kit', 'speed', 'endurance', 'coordination', 'timing']
export const WARMUP_DURATIONS = [5, 10, 15, 20]

function wu(id, title, category, difficulty, durationMinutes, goal, steps, opts = {}) {
  return {
    id,
    name: title,
    title,
    category,
    focus: opts.focus || category,
    difficulty,
    durationMinutes,
    goal,
    description: opts.description || goal,
    steps,
    relatedRudiments: opts.rudiments || []
  }
}

export const WARMUPS = [
  // ---------- Practice Pad ----------
  wu('five-min-pad-warmup', '5-Minute Pad Warmup', 'practice-pad', 'beginner', 5,
    'Wake up the hands before you play.',
    [
      '1 min — single strokes at a comfortable tempo, full strokes.',
      '1 min — double strokes, focus on even rebound.',
      '1 min — single paradiddles, accent the first note.',
      '1 min — eighth-note accents, one bar accented / one bar tapped.',
      '1 min — free singles building soft to loud and back.'
    ],
    { rudiments: ['single-stroke-roll', 'double-stroke-roll', 'single-paradiddle'] }),
  wu('pad-stick-control', 'Stick Control Routine', 'practice-pad', 'intermediate', 15,
    'Build clean, balanced hands using Stick Control patterns.',
    [
      '3 min — RLRL and LRLR, perfectly even.',
      '4 min — RRLL / LLRR doubles, matched heights.',
      '4 min — paradiddle inversions (RLRR, RRLR, RLLR…).',
      '4 min — accent/tap combinations, slow and clean.'
    ],
    { rudiments: ['single-stroke-roll', 'double-stroke-roll', 'single-paradiddle'] }),
  wu('pad-accent-tap', 'Accent & Tap Builder', 'practice-pad', 'intermediate', 10,
    'Develop dynamic control between accents and taps.',
    [
      '3 min — single accents moving around the bar.',
      '4 min — accent on 1 of each group, taps soft.',
      '3 min — increase tempo while keeping the contrast.'
    ],
    { rudiments: ['single-stroke-roll'] }),
  wu('pad-rudiment-rotation', 'Rudiment Rotation', 'practice-pad', 'advanced', 20,
    'Cycle the essential rudiments to keep them sharp.',
    [
      '5 min — single & double stroke rolls.',
      '5 min — paradiddle family.',
      '5 min — flams (flam tap, flam accent).',
      '5 min — drags & ratamacues.'
    ],
    { rudiments: ['double-stroke-roll', 'double-paradiddle', 'flam-tap', 'single-ratamacue'] }),

  // ---------- Full Kit ----------
  wu('full-kit-flow', 'Full-Kit Flow', 'full-kit', 'beginner', 10,
    'Loosen up around the whole kit.',
    [
      '3 min — basic rock beat, relaxed.',
      '3 min — singles around the toms.',
      '4 min — simple grooves with one-bar fills.'
    ],
    { rudiments: ['single-stroke-roll'] }),
  wu('full-kit-fills', 'Fill Vocabulary Warmup', 'full-kit', 'intermediate', 15,
    'Warm up your fills and orchestration.',
    [
      '4 min — groove with four-stroke fills.',
      '5 min — paradiddle fills around the toms.',
      '6 min — trade 1 bar groove / 1 bar fill.'
    ],
    { rudiments: ['single-paradiddle', 'single-stroke-roll'] }),
  wu('full-kit-dynamics', 'Dynamics Around the Kit', 'full-kit', 'intermediate', 10,
    'Practice playing the kit softly to loudly.',
    [
      '3 min — groove at a whisper.',
      '4 min — crescendo over 4 bars and back.',
      '3 min — ghost notes vs accents.'
    ]),
  wu('full-kit-groove-tour', 'Groove Tour', 'full-kit', 'advanced', 20,
    'Cycle through several feels to start a session.',
    [
      '5 min — rock and funk.',
      '5 min — shuffle and blues.',
      '5 min — jazz swing.',
      '5 min — a latin feel (bossa or samba).'
    ]),

  // ---------- Speed ----------
  wu('speed-builder-warmup', 'Speed Builder Warmup', 'speed', 'intermediate', 8,
    'Raise your single- and double-stroke ceiling.',
    [
      '2 min — single strokes at a clean tempo.',
      'Raise the metronome 5 BPM and play 1 min of singles.',
      'Repeat the 5-BPM increase until form breaks down.',
      'Drop back 10 BPM and finish with 2 min of relaxed doubles.'
    ],
    { rudiments: ['single-stroke-roll', 'double-stroke-roll'] }),
  wu('single-stroke-pyramid', 'Single Stroke Pyramid', 'speed', 'intermediate', 10,
    'Endurance and control ramping subdivisions up and down.',
    [
      'Set the metronome to ~80 BPM.',
      'Play 1 bar each: quarters, eighths, triplets, sixteenths.',
      'Reverse back down: sixteenths, triplets, eighths, quarters.',
      'Keep stroke height consistent across subdivisions.',
      'Repeat, nudging the tempo up when it feels easy.'
    ],
    { rudiments: ['single-stroke-roll'] }),
  wu('speed-bursts', 'Speed Bursts', 'speed', 'advanced', 10,
    'Short fast bursts to push your top speed safely.',
    [
      '4 min — 4-beat bursts of fast singles, full rest between.',
      '3 min — same with doubles.',
      '3 min — paradiddle bursts.'
    ],
    { rudiments: ['single-stroke-roll', 'double-stroke-roll', 'single-paradiddle'] }),
  wu('double-stroke-speed', 'Double Stroke Speed', 'speed', 'advanced', 15,
    'Open up your double-stroke roll.',
    [
      '5 min — slow controlled doubles.',
      '5 min — tempo ladder +5 BPM each minute.',
      '5 min — open-to-buzz transition practice.'
    ],
    { rudiments: ['double-stroke-roll', 'multiple-bounce-roll'] }),

  // ---------- Endurance ----------
  wu('endurance-singles', 'Single Stroke Endurance', 'endurance', 'intermediate', 10,
    'Sustain clean singles to build stamina.',
    [
      'Set a moderate tempo you can hold.',
      'Play continuous sixteenth singles for 3 minutes.',
      'Rest 1 minute, then repeat.',
      'Keep tension low — stop if form degrades.'
    ],
    { rudiments: ['single-stroke-roll'] }),
  wu('endurance-double-bass', 'Double Bass Endurance', 'endurance', 'advanced', 15,
    'Build stamina in the feet.',
    [
      '5 min — steady eighth-note double bass.',
      '5 min — alternate 4 bars on / 4 bars rest.',
      '5 min — sixteenth bursts with recovery.'
    ]),
  wu('endurance-groove-hold', 'Groove Endurance', 'endurance', 'intermediate', 20,
    'Hold a groove without drifting or tightening up.',
    [
      'Pick one groove and a comfortable tempo.',
      'Play it continuously for 5-minute blocks.',
      'Check posture and tension each block.',
      'Stay relaxed for the full 20 minutes.'
    ]),
  wu('endurance-accent-stamina', 'Accent Stamina', 'endurance', 'advanced', 10,
    'Maintain strong accents over a long stretch.',
    [
      '5 min — accented sixteenths, one accent per beat.',
      '5 min — move the accent through the bar each minute.'
    ],
    { rudiments: ['single-stroke-roll'] }),

  // ---------- Coordination ----------
  wu('beginner-coordination-warmup', 'Beginner Coordination Warmup', 'coordination', 'beginner', 10,
    'Build basic four-limb coordination.',
    [
      '2 min — quarter notes on hats, kick on 1 and 3.',
      '2 min — add snare on 2 and 4 (basic rock beat).',
      '3 min — switch hats to eighth notes.',
      '3 min — add the “and” of 3 on the kick.'
    ]),
  wu('hand-foot-coordination', 'Hand & Foot Coordination', 'coordination', 'intermediate', 12,
    'Tighten hand/foot timing.',
    [
      '3 min — hands and kick in unison on quarters.',
      '3 min — alternate hand, foot, hand, foot as eighths.',
      '3 min — RLF triplets around the kit.',
      '3 min — steady hat foot on 2 and 4 throughout.'
    ]),
  wu('independence-ostinato', 'Ostinato Independence', 'coordination', 'advanced', 15,
    'Layer melodies over a fixed foot pattern.',
    [
      '5 min — lock a samba or jazz foot ostinato.',
      '5 min — improvise singles over it with the hands.',
      '5 min — add the snare on syncopated spots.'
    ],
    { rudiments: ['single-stroke-roll'] }),
  wu('ghost-note-coordination', 'Ghost Note Coordination', 'coordination', 'advanced', 10,
    'Integrate ghost notes under a steady groove.',
    [
      '4 min — backbeat with a single ghost before 2 and 4.',
      '3 min — add ghosts on the “e” and “a”.',
      '3 min — full funk groove with a ghost carpet.'
    ],
    { rudiments: ['single-paradiddle'] }),

  // ---------- Timing ----------
  wu('timing-click-lock', 'Lock to the Click', 'timing', 'beginner', 5,
    'Center your time against a metronome.',
    [
      '2 min — quarter notes exactly on the click.',
      '2 min — play so the click “disappears”.',
      '1 min — drop to half-time, stay locked.'
    ],
    { rudiments: ['single-stroke-roll'] }),
  wu('timing-subdivision', 'Subdivision Timing', 'timing', 'intermediate', 10,
    'Feel every subdivision evenly.',
    [
      '2 min each — quarters, eighths, triplets, sixteenths to a click.',
      '2 min — switch subdivision every bar on cue.'
    ],
    { rudiments: ['single-stroke-roll'] }),
  wu('timing-gap-click', 'Gap Click Training', 'timing', 'advanced', 15,
    'Keep time when the click drops out.',
    [
      'Set the metronome to play only beat 1 (or every other bar).',
      '5 min — quarter notes filling the gaps.',
      '5 min — a groove keeping time through the silence.',
      '5 min — widen the gap as you improve.'
    ]),
  wu('timing-slow-tempo', 'Slow Tempo Control', 'timing', 'advanced', 10,
    'Master the hardest skill: playing slowly in time.',
    [
      'Set the metronome to 50 BPM.',
      '5 min — quarter notes dead-center.',
      '5 min — a simple groove without rushing.'
    ]),
  wu('timing-feel-shifts', 'Feel Shifts', 'timing', 'intermediate', 10,
    'Practice pushing, laying back, and centering the time.',
    [
      '3 min — play right on the click.',
      '3 min — lay slightly behind for a relaxed feel.',
      '4 min — push slightly ahead, then re-center.'
    ])
]

export function getWarmupById(id) {
  return WARMUPS.find((w) => w.id === id) ?? null
}
