/**
 * Static skill tree. Three branches of nodes; each node may require other nodes
 * to be completed before it becomes "available". Completion is user-controlled
 * (no automatic evaluation) and stored in `users/{uid}/skillTree/{nodeId}`.
 */
export const SKILL_BRANCHES = [
  {
    id: 'beginner',
    title: 'Beginner',
    nodes: [
      { id: 'quarter-notes', name: 'Quarter Notes', description: 'Steady quarter-note timing with a metronome.', requires: [] },
      { id: 'eighth-notes', name: 'Eighth Notes', description: 'Even eighth notes and basic subdivision.', requires: ['quarter-notes'] },
      { id: 'single-stroke-roll', name: 'Single Stroke Roll', description: 'Clean alternating single strokes at moderate tempo.', requires: ['quarter-notes'] },
      { id: 'basic-rock-beat', name: 'Basic Rock Beat', description: 'Kick on 1 & 3, snare on 2 & 4, eighth-note hats.', requires: ['eighth-notes'] }
    ]
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    nodes: [
      { id: 'paradiddles', name: 'Paradiddles', description: 'Single paradiddle with clear accents.', requires: ['single-stroke-roll'] },
      { id: 'double-paradiddles', name: 'Double Paradiddles', description: 'Double paradiddle in a triplet feel.', requires: ['paradiddles'] },
      { id: 'flams', name: 'Flams', description: 'Controlled flams, flam tap, and flam accent.', requires: ['single-stroke-roll'] },
      { id: 'shuffle-groove', name: 'Shuffle Groove', description: 'Triplet-based shuffle with a solid backbeat.', requires: ['basic-rock-beat'] }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    nodes: [
      { id: 'linear-grooves', name: 'Linear Grooves', description: 'Grooves where no two limbs strike together.', requires: ['shuffle-groove', 'paradiddles'] },
      { id: 'odd-time-foundations', name: 'Odd Time Foundations', description: 'Counting and grooving in 5/4 and 7/8.', requires: ['shuffle-groove'] },
      { id: 'advanced-coordination', name: 'Advanced Coordination', description: 'Four-way independence with ghost notes and ostinatos.', requires: ['double-paradiddles', 'shuffle-groove'] }
    ]
  }
]

export const ALL_SKILL_NODES = SKILL_BRANCHES.flatMap((b) => b.nodes)

/**
 * Derive each node's status from the set of completed node ids.
 * @returns {{ [nodeId]: 'completed' | 'available' | 'locked' }}
 */
export function deriveStatuses(completedSet) {
  const statuses = {}
  for (const node of ALL_SKILL_NODES) {
    if (completedSet.has(node.id)) statuses[node.id] = 'completed'
    else if (node.requires.every((r) => completedSet.has(r))) statuses[node.id] = 'available'
    else statuses[node.id] = 'locked'
  }
  return statuses
}
