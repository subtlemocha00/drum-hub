/**
 * Rudiment catalog — the 40 international drum rudiments (PAS) plus a few common
 * hybrids, grouped into the categories Drum Hub uses.
 *
 * This is STATIC content (no Firestore). Only user-specific progress and
 * favorites are persisted. Add or edit rudiments here without touching app code.
 *
 * Fields: id, name, category, difficulty, description, notation (text sticking),
 * bpmMin/bpmMax, practiceNotes, commonUses, skill (skill-tree node id | null),
 * videoUrl. Relationships to grooves/warmups/plans are derived elsewhere
 * (see src/data/relationships.js).
 */
export const RUDIMENT_CATEGORIES = ['rolls', 'paradiddles', 'flams', 'drags', 'ratamacues', 'hybrids']
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

const yt = (q) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' drum rudiment lesson')}`

function rud(id, name, category, difficulty, description, opts = {}) {
  return {
    id,
    name,
    category,
    difficulty,
    description,
    notation: opts.notation || '',
    bpmMin: opts.bpmMin ?? 60,
    bpmMax: opts.bpmMax ?? 160,
    practiceNotes: opts.practiceNotes || '',
    commonUses: opts.commonUses || '',
    skill: opts.skill || null,
    videoUrl: opts.videoUrl || yt(name)
  }
}

export const RUDIMENTS = [
  // ---------- Rolls ----------
  rud('single-stroke-roll', 'Single Stroke Roll', 'rolls', 'beginner',
    'Alternating single strokes between the hands — the foundation of speed and control.',
    { notation: 'R L R L R L R L', bpmMin: 60, bpmMax: 200, skill: 'single-stroke-roll',
      practiceNotes: 'Keep strokes even in height and volume; relax as tempo rises.',
      commonUses: 'Fills, single-stroke rolls around the kit, fast runs.' }),
  rud('single-stroke-four', 'Single Stroke Four', 'rolls', 'beginner',
    'Four alternating singles phrased as a triplet plus an accent.',
    { notation: 'R L R  L  (accent last)', bpmMin: 60, bpmMax: 160,
      practiceNotes: 'Useful for short triplet fills; lead with both hands.',
      commonUses: 'Quick triplet fills and transitions.' }),
  rud('single-stroke-seven', 'Single Stroke Seven', 'rolls', 'intermediate',
    'Seven alternating singles, often phrased over two triplet groupings.',
    { notation: 'R L R L R L R', bpmMin: 60, bpmMax: 160,
      practiceNotes: 'Land the final accent cleanly; great for triplet-based fills.' }),
  rud('multiple-bounce-roll', 'Multiple Bounce Roll', 'rolls', 'beginner',
    'The "buzz" or "press" roll — each stroke bounces multiple times for a smooth sound.',
    { notation: 'buzz buzz (R L R L)', bpmMin: 60, bpmMax: 140,
      practiceNotes: 'Press into the head for even, sustained buzzes. Smooth, not gritty.',
      commonUses: 'Orchestral rolls, smooth snare swells, ballad textures.' }),
  rud('triple-stroke-roll', 'Triple Stroke Roll', 'rolls', 'intermediate',
    'Three controlled strokes per hand (a "French roll").',
    { notation: 'R R R L L L', bpmMin: 50, bpmMax: 150,
      practiceNotes: 'Control all three strokes; don’t let the third die out.' }),
  rud('double-stroke-roll', 'Double Stroke Roll', 'rolls', 'beginner',
    'Two strokes per hand. Builds the bounce and rebound control behind the long roll.',
    { notation: 'R R L L R R L L', bpmMin: 50, bpmMax: 170,
      practiceNotes: 'Let the second stroke rebound naturally; keep doubles matched.',
      commonUses: 'Long rolls, double-stroke fills, drumline phrasing.' }),
  rud('five-stroke-roll', 'Five Stroke Roll', 'rolls', 'intermediate',
    'Two doubles plus an accent — a staple short roll.',
    { notation: 'R R L L R   /   L L R R L', bpmMin: 60, bpmMax: 160,
      commonUses: 'Snare fills, backbeat decoration, marching cadences.' }),
  rud('six-stroke-roll', 'Six Stroke Roll', 'rolls', 'intermediate',
    'Accent–double–double–accent grouping that grooves well in triplets.',
    { notation: 'R LL RR L (accents outer)', bpmMin: 60, bpmMax: 160,
      commonUses: 'Triplet grooves, jazz/rock fills, ostinato patterns.' }),
  rud('seven-stroke-roll', 'Seven Stroke Roll', 'rolls', 'intermediate',
    'Three doubles plus an accent.',
    { notation: 'R R L L R R L', bpmMin: 60, bpmMax: 150 }),
  rud('nine-stroke-roll', 'Nine Stroke Roll', 'rolls', 'intermediate',
    'Four doubles plus an accent — a longer cousin of the five-stroke roll.',
    { notation: 'R R L L R R L L R', bpmMin: 60, bpmMax: 150 }),
  rud('ten-stroke-roll', 'Ten Stroke Roll', 'rolls', 'advanced',
    'Doubles capped with two accents.',
    { notation: 'R R L L R R L L R L', bpmMin: 60, bpmMax: 140 }),
  rud('eleven-stroke-roll', 'Eleven Stroke Roll', 'rolls', 'advanced',
    'Five doubles plus an accent.',
    { notation: 'R R L L R R L L R R L', bpmMin: 60, bpmMax: 140 }),
  rud('thirteen-stroke-roll', 'Thirteen Stroke Roll', 'rolls', 'advanced',
    'Six doubles plus an accent.',
    { notation: 'R R L L R R L L R R L L R', bpmMin: 60, bpmMax: 130 }),
  rud('fifteen-stroke-roll', 'Fifteen Stroke Roll', 'rolls', 'advanced',
    'Seven doubles plus an accent.',
    { notation: 'RRLLRRLLRRLLRRL', bpmMin: 60, bpmMax: 130 }),
  rud('seventeen-stroke-roll', 'Seventeen Stroke Roll', 'rolls', 'advanced',
    'Eight doubles plus an accent — an endurance roll.',
    { notation: 'RRLLRRLLRRLLRRLLR', bpmMin: 60, bpmMax: 120 }),

  // ---------- Paradiddles ----------
  rud('single-paradiddle', 'Single Paradiddle', 'paradiddles', 'beginner',
    'The classic RLRR / LRLL pattern. Develops hand-to-hand independence and accents.',
    { notation: 'R L R R  L R L L', bpmMin: 60, bpmMax: 180, skill: 'paradiddles',
      practiceNotes: 'Accent the first note of each grouping to bring out the pattern.',
      commonUses: 'Grooves, fills, moving accents around the kit.' }),
  rud('double-paradiddle', 'Double Paradiddle', 'paradiddles', 'intermediate',
    'Six-note paradiddle, perfect for triplet-based phrasing.',
    { notation: 'R L R L R R  L R L R L L', bpmMin: 60, bpmMax: 170, skill: 'double-paradiddles',
      commonUses: 'Triplet grooves and fills, jazz comping.' }),
  rud('triple-paradiddle', 'Triple Paradiddle', 'paradiddles', 'intermediate',
    'Eight-note paradiddle that flows over straight sixteenths.',
    { notation: 'R L R L R L R R  L R L R L R L L', bpmMin: 60, bpmMax: 160 }),
  rud('paradiddle-diddle', 'Paradiddle-diddle', 'paradiddles', 'intermediate',
    'RLRRLL — a six-note hybrid that sits great in triplet fills.',
    { notation: 'R L R R L L', bpmMin: 60, bpmMax: 170,
      commonUses: 'Fast triplet fills, double-bass linear patterns.' }),

  // ---------- Flams ----------
  rud('single-flam', 'Flam', 'flams', 'beginner',
    'A grace note immediately before a primary stroke, thickening the sound.',
    { notation: 'lR    rL', bpmMin: 50, bpmMax: 140, skill: 'flams',
      practiceNotes: 'Keep the grace note low and quiet; the main note is the accent.',
      commonUses: 'Accenting backbeats, fattening hits, marching snare.' }),
  rud('flam-accent', 'Flam Accent', 'flams', 'intermediate',
    'A flam followed by two alternating taps — a triplet feel.',
    { notation: 'lR L R   rL R L', bpmMin: 50, bpmMax: 140,
      commonUses: 'Triplet grooves and fills.' }),
  rud('flam-tap', 'Flam Tap', 'flams', 'intermediate',
    'A flam followed by a tap on the same hand, then alternate.',
    { notation: 'lR R   rL L', bpmMin: 50, bpmMax: 140, skill: 'flams' }),
  rud('flamacue', 'Flamacue', 'flams', 'advanced',
    'A flam, three taps with an accent on the second, and a closing flam.',
    { notation: 'lR L R L  rL', bpmMin: 50, bpmMax: 130 }),
  rud('flam-paradiddle', 'Flam Paradiddle', 'flams', 'intermediate',
    'A flammed paradiddle ("flamadiddle").',
    { notation: 'lR L R R  rL R L L', bpmMin: 50, bpmMax: 140 }),
  rud('single-flammed-mill', 'Single Flammed Mill', 'flams', 'advanced',
    'A flam followed by a diddle and alternating strokes.',
    { notation: 'lR R L R  rL L R L', bpmMin: 50, bpmMax: 130 }),
  rud('flam-paradiddle-diddle', 'Flam Paradiddle-diddle', 'flams', 'advanced',
    'A flammed paradiddle-diddle.',
    { notation: 'lR L R R L L  rL R L L R R', bpmMin: 50, bpmMax: 130 }),
  rud('inverted-flam-tap', 'Inverted Flam Tap', 'flams', 'advanced',
    'Flam taps with the flams inverted between the hands.',
    { notation: 'lR rL  (inverted)', bpmMin: 50, bpmMax: 130 }),

  // ---------- Drags ----------
  rud('single-drag', 'Drag', 'drags', 'beginner',
    'Two grace notes (a diddle) before a primary stroke — a tighter ornament than the flam.',
    { notation: 'llR    rrL', bpmMin: 50, bpmMax: 130,
      practiceNotes: 'Play the grace notes cleanly and quietly into the main note.',
      commonUses: 'Ornamenting backbeats, marching snare, fills.' }),
  rud('single-drag-tap', 'Single Drag Tap', 'drags', 'intermediate',
    'A drag followed by an accented tap.',
    { notation: 'llR L  rrL R', bpmMin: 50, bpmMax: 130 }),
  rud('double-drag-tap', 'Double Drag Tap', 'drags', 'intermediate',
    'Two drags followed by an accented tap.',
    { notation: 'llR llR L  rrL rrL R', bpmMin: 50, bpmMax: 120 }),
  rud('lesson-25', 'Lesson 25', 'drags', 'intermediate',
    'A drag and an accented note — a classic two-stroke drag rudiment.',
    { notation: 'llR  L', bpmMin: 50, bpmMax: 130 }),
  rud('single-dragadiddle', 'Single Dragadiddle', 'drags', 'advanced',
    'A drag combined with a paradiddle.',
    { notation: 'R(drag) R L R R', bpmMin: 50, bpmMax: 120 }),
  rud('drag-paradiddle-1', 'Drag Paradiddle #1', 'drags', 'advanced',
    'An accented stroke and drag combined with a paradiddle.',
    { notation: 'R  llR L R R   L  rrL R L L', bpmMin: 50, bpmMax: 120 }),
  rud('drag-paradiddle-2', 'Drag Paradiddle #2', 'drags', 'advanced',
    'A longer drag paradiddle with two drags per hand.',
    { notation: 'R R llR L R R', bpmMin: 50, bpmMax: 120 }),

  // ---------- Ratamacues ----------
  rud('single-ratamacue', 'Single Ratamacue', 'ratamacues', 'intermediate',
    'A drag followed by three notes with an accent on the last — a triplet phrase.',
    { notation: 'llR L R L (accent last)', bpmMin: 50, bpmMax: 130,
      commonUses: 'Triplet fills and marching phrases.' }),
  rud('double-ratamacue', 'Double Ratamacue', 'ratamacues', 'advanced',
    'Two drags leading into the ratamacue figure.',
    { notation: 'llR llR L R L', bpmMin: 50, bpmMax: 120 }),
  rud('triple-ratamacue', 'Triple Ratamacue', 'ratamacues', 'advanced',
    'Three drags leading into the ratamacue figure.',
    { notation: 'llR llR llR L R L', bpmMin: 50, bpmMax: 110 }),

  // ---------- Hybrids ----------
  rud('swiss-army-triplet', 'Swiss Army Triplet', 'hybrids', 'advanced',
    'A flam followed by a diddle, phrased as a triplet — fluid around the kit.',
    { notation: 'lR R L   rL L R', bpmMin: 60, bpmMax: 160,
      commonUses: 'Fast, smooth triplet fills around the toms.' }),
  rud('pataflafla', 'Pataflafla', 'hybrids', 'advanced',
    'Two flams surrounding inner taps — a busy, accented hybrid.',
    { notation: 'lR L R rL', bpmMin: 50, bpmMax: 130 }),
  rud('flam-drag', 'Flam Drag', 'hybrids', 'advanced',
    'A flam, a drag, and a stroke combined into one figure.',
    { notation: 'lR rrL R', bpmMin: 50, bpmMax: 130 })
]

export function getRudimentById(id) {
  return RUDIMENTS.find((r) => r.id === id) ?? null
}
