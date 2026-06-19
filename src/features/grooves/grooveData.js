/**
 * Starter groove catalog, seeded into `users/{uid}/grooves` on first use.
 * `youtubeUrl` is a YouTube search link by default (see rudimentData for the
 * embed-upgrade note).
 */
export const GROOVE_STYLES = ['rock', 'funk', 'jazz', 'latin', 'metal']

const search = (q) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' drum groove')}`

export const GROOVES = [
  {
    id: 'basic-rock-beat',
    name: 'Basic Rock Beat',
    style: 'rock',
    timeSignature: '4/4',
    bpm: 90,
    description: 'Kick on 1 and 3, snare on 2 and 4, steady eighths on the hats.',
    notes: 'The first beat every drummer should own. Keep the hats relaxed and even.',
    youtubeUrl: search('basic rock beat')
  },
  {
    id: 'eighth-note-rock',
    name: 'Driving Eighth Rock',
    style: 'rock',
    timeSignature: '4/4',
    bpm: 120,
    description: 'Busier kick pattern under straight eighth hats for energy.',
    notes: 'Add the “and” of 3 on the kick to push the groove forward.',
    youtubeUrl: search('eighth note rock beat')
  },
  {
    id: 'funk-sixteenth-groove',
    name: 'Sixteenth Funk Groove',
    style: 'funk',
    timeSignature: '4/4',
    bpm: 100,
    description: 'Ghost-note snare and syncopated kick over sixteenth-note hats.',
    notes: 'Keep ghost notes whisper-quiet so the backbeat pops.',
    youtubeUrl: search('sixteenth note funk groove')
  },
  {
    id: 'half-time-shuffle',
    name: 'Half-Time Shuffle',
    style: 'funk',
    timeSignature: '4/4',
    bpm: 90,
    description: 'Triplet-based shuffle with ghost notes — the Purdie/Porcaro feel.',
    notes: 'Advanced. Lock the hand triplets first, then add ghosted snares.',
    youtubeUrl: search('half time shuffle')
  },
  {
    id: 'jazz-swing-ride',
    name: 'Jazz Swing (Ride)',
    style: 'jazz',
    timeSignature: '4/4',
    bpm: 140,
    description: 'Spang-a-lang ride pattern with hi-hat on 2 and 4.',
    notes: 'Feel the triplet swing. Keep the ride light and buoyant.',
    youtubeUrl: search('jazz swing ride pattern')
  },
  {
    id: 'bossa-nova',
    name: 'Bossa Nova',
    style: 'latin',
    timeSignature: '4/4',
    bpm: 120,
    description: 'Cross-stick clave pattern with steady hats and a soft kick.',
    notes: 'Keep the rim-click clave consistent — it’s the heartbeat of the groove.',
    youtubeUrl: search('bossa nova drum beat')
  },
  {
    id: 'samba',
    name: 'Samba',
    style: 'latin',
    timeSignature: '4/4',
    bpm: 100,
    description: 'Driving surdo-style kick pattern with sixteenth ride/hat.',
    notes: 'Anchor the “1-and” surdo kick. Great for foot independence.',
    youtubeUrl: search('samba drum set groove')
  },
  {
    id: 'double-bass-metal',
    name: 'Double Bass Metal',
    style: 'metal',
    timeSignature: '4/4',
    bpm: 160,
    description: 'Continuous double-bass eighths with a driving backbeat.',
    notes: 'Start slow for evenness between feet before pushing the tempo.',
    youtubeUrl: search('double bass metal beat')
  }
]
