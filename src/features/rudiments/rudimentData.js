/**
 * Starter rudiment catalog, seeded into `users/{uid}/rudiments` on first use.
 *
 * `id` is stable so rudimentProgress and favorites can reference it.
 * `notation` is plain-text sticking (R/L) — a simple placeholder for future
 * score images.
 *
 * `videoUrl` seeds with a YouTube *search* link (always valid + clickable). The
 * detail page embeds a player automatically when a real `watch?v=...` URL is
 * present, so these can be upgraded to specific lessons any time.
 */
export const RUDIMENT_CATEGORIES = ['rolls', 'flams', 'drags', 'paradiddles', 'hybrids']

const search = (q) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' drum rudiment lesson')}`

export const RUDIMENTS = [
  {
    id: 'single-stroke-roll',
    name: 'Single Stroke Roll',
    category: 'rolls',
    difficulty: 'beginner',
    description:
      'Alternating single strokes between the hands — the foundation of speed and control.',
    notation: 'R L R L R L R L',
    bpmMin: 60,
    bpmMax: 200,
    notes: 'Keep strokes even in height and volume. Relax the grip as tempo rises.',
    videoUrl: search('single stroke roll')
  },
  {
    id: 'double-stroke-roll',
    name: 'Double Stroke Roll',
    category: 'rolls',
    difficulty: 'beginner',
    description:
      'Two strokes per hand. Builds the bounce and rebound control behind the buzz roll.',
    notation: 'R R L L R R L L',
    bpmMin: 50,
    bpmMax: 160,
    notes: 'Let the second stroke rebound naturally; don’t force it with the wrist.',
    videoUrl: search('double stroke roll')
  },
  {
    id: 'five-stroke-roll',
    name: 'Five Stroke Roll',
    category: 'rolls',
    difficulty: 'intermediate',
    description: 'A short roll of two doubles plus an accent — great for fills.',
    notation: 'RR LL R   /   LL RR L',
    bpmMin: 60,
    bpmMax: 150,
    notes: 'Accent the final single. Practice leading with both hands.',
    videoUrl: search('five stroke roll')
  },
  {
    id: 'single-paradiddle',
    name: 'Single Paradiddle',
    category: 'paradiddles',
    difficulty: 'beginner',
    description:
      'The classic RLRR / LRLL pattern. Develops hand-to-hand independence and accents.',
    notation: 'R L R R  L R L L',
    bpmMin: 60,
    bpmMax: 180,
    notes: 'Accent the first note of each grouping to bring out the pattern.',
    videoUrl: search('single paradiddle')
  },
  {
    id: 'double-paradiddle',
    name: 'Double Paradiddle',
    category: 'paradiddles',
    difficulty: 'intermediate',
    description: 'Six-note paradiddle, perfect for triplet-based phrasing.',
    notation: 'R L R L R R  L R L R L L',
    bpmMin: 60,
    bpmMax: 160,
    notes: 'Feel it in two groups of three. Keep the diddle relaxed.',
    videoUrl: search('double paradiddle')
  },
  {
    id: 'triple-paradiddle',
    name: 'Triple Paradiddle',
    category: 'paradiddles',
    difficulty: 'intermediate',
    description: 'Eight-note paradiddle that flows well over straight sixteenths.',
    notation: 'R L R L R L R R  L R L R L R L L',
    bpmMin: 60,
    bpmMax: 150,
    notes: 'Stay even through the singles before the closing diddle.',
    videoUrl: search('triple paradiddle')
  },
  {
    id: 'paradiddle-diddle',
    name: 'Paradiddle-diddle',
    category: 'paradiddles',
    difficulty: 'intermediate',
    description: 'RLRRLL — a six-note hybrid that sits great in triplet fills.',
    notation: 'R L R R L L',
    bpmMin: 60,
    bpmMax: 160,
    notes: 'Lead with each hand. Common around the toms for fast fills.',
    videoUrl: search('paradiddle diddle')
  },
  {
    id: 'single-flam',
    name: 'Flam',
    category: 'flams',
    difficulty: 'beginner',
    description:
      'A grace note immediately before a primary stroke, thickening the sound.',
    notation: 'lR    rL',
    bpmMin: 50,
    bpmMax: 140,
    notes: 'Keep the grace note low and quiet; the main note is the accent.',
    videoUrl: search('flam rudiment')
  },
  {
    id: 'flam-tap',
    name: 'Flam Tap',
    category: 'flams',
    difficulty: 'intermediate',
    description: 'A flam followed by a tap on the same hand, then alternate.',
    notation: 'lR R   rL L',
    bpmMin: 50,
    bpmMax: 140,
    notes: 'The tap should match the flam’s main-note height for evenness.',
    videoUrl: search('flam tap')
  },
  {
    id: 'flam-accent',
    name: 'Flam Accent',
    category: 'flams',
    difficulty: 'intermediate',
    description: 'A flam followed by two alternating taps — a triplet feel.',
    notation: 'lR L R   rL R L',
    bpmMin: 50,
    bpmMax: 140,
    notes: 'Phrase in triplets. Keep the two taps soft under the flam accent.',
    videoUrl: search('flam accent')
  },
  {
    id: 'single-drag',
    name: 'Drag',
    category: 'drags',
    difficulty: 'beginner',
    description:
      'Two grace notes (a diddle) before a primary stroke — a tighter ornament than the flam.',
    notation: 'llR    rrL',
    bpmMin: 50,
    bpmMax: 130,
    notes: 'Play the grace notes cleanly and quietly into the main note.',
    videoUrl: search('drag rudiment')
  },
  {
    id: 'drag-paradiddle-1',
    name: 'Drag Paradiddle #1',
    category: 'drags',
    difficulty: 'advanced',
    description: 'An accented stroke and drag combined with a paradiddle.',
    notation: 'R  llR L R R   L  rrL R L L',
    bpmMin: 50,
    bpmMax: 120,
    notes: 'Place the drag cleanly without rushing into the paradiddle.',
    videoUrl: search('drag paradiddle number 1')
  },
  {
    id: 'swiss-army-triplet',
    name: 'Swiss Army Triplet',
    category: 'hybrids',
    difficulty: 'advanced',
    description:
      'A hybrid rudiment: a flam followed by a diddle, phrased as a triplet.',
    notation: 'lR R L   rL L R',
    bpmMin: 60,
    bpmMax: 150,
    notes: 'Great for fast, fluid triplet fills around the kit.',
    videoUrl: search('swiss army triplet')
  }
]
