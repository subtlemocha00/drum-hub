/**
 * Starter warmup routines, seeded into `users/{uid}/warmups` on first use.
 * `steps` is a simple ordered list of plain-text instructions.
 */
export const WARMUP_FOCUS = ['timing', 'coordination', 'speed']

export const WARMUPS = [
  {
    id: 'five-min-pad-warmup',
    name: '5-Minute Pad Warmup',
    durationMinutes: 5,
    focus: 'timing',
    description:
      'A quick, no-kit warmup on a practice pad to wake up the hands before you play.',
    steps: [
      '1 min — single strokes at a comfortable tempo, full strokes.',
      '1 min — double strokes, focus on even rebound.',
      '1 min — single paradiddles, accent the first note.',
      '1 min — eighth-note accents, one bar accented / one bar tapped.',
      '1 min — free single strokes building from soft to loud and back.'
    ]
  },
  {
    id: 'beginner-coordination-warmup',
    name: 'Beginner Coordination Warmup',
    durationMinutes: 10,
    focus: 'coordination',
    description:
      'Builds basic four-limb coordination with a simple rock beat and variations.',
    steps: [
      '2 min — quarter notes on the hats with kick on 1 and 3.',
      '2 min — add snare on 2 and 4 (basic rock beat).',
      '3 min — switch hats to eighth notes, keep the backbeat steady.',
      '3 min — add the “and” of 3 on the kick, stay relaxed.'
    ]
  },
  {
    id: 'speed-builder-warmup',
    name: 'Speed Builder Warmup',
    durationMinutes: 8,
    focus: 'speed',
    description:
      'A metronome-driven push to raise your single- and double-stroke ceiling.',
    steps: [
      '2 min — single strokes at a tempo you can play cleanly.',
      'Raise the metronome 5 BPM and play 1 min of singles.',
      'Repeat the 5-BPM increase until form breaks down.',
      'Drop back 10 BPM and finish with 2 min of relaxed doubles.'
    ]
  },
  {
    id: 'single-stroke-pyramid',
    name: 'Single Stroke Pyramid',
    durationMinutes: 10,
    focus: 'speed',
    description:
      'A classic endurance and control builder ramping subdivisions up and down.',
    steps: [
      'Set the metronome to ~80 BPM.',
      'Play 1 bar each: quarters, eighths, triplets, sixteenths.',
      'Reverse back down: sixteenths, triplets, eighths, quarters.',
      'Keep stroke height consistent across all subdivisions.',
      'Repeat, nudging the tempo up when it feels easy.'
    ]
  },
  {
    id: 'hand-foot-coordination',
    name: 'Hand & Foot Coordination',
    durationMinutes: 12,
    focus: 'coordination',
    description: 'Unison and alternating hand/foot patterns to tighten limb timing.',
    steps: [
      '3 min — hands and kick in unison on quarter notes.',
      '3 min — alternate: hand, foot, hand, foot as eighth notes.',
      '3 min — RLF (right, left, foot) triplets around the kit.',
      '3 min — keep a steady hat foot on 2 and 4 throughout.'
    ]
  }
]
