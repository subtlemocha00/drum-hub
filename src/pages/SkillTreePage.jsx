import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../features/auth/useAuth.js'
import { SKILL_BRANCHES, deriveStatuses } from '../features/skills/skillData.js'
import { getCompletedSkills, setSkillCompleted } from '../features/skills/skillService.js'
import { FullScreenLoader } from '../components/Loader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const STATUS_LABEL = { completed: 'Completed', available: 'Available', locked: 'Locked' }

/** Lightweight progression map. Completion is user-controlled. */
export function SkillTreePage() {
  useDocumentTitle('Skill Tree')
  const { user } = useAuth()
  const [completedSet, setCompletedSet] = useState(() => new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    getCompletedSkills(user.uid)
      .then((set) => !cancelled && setCompletedSet(set))
      .catch(() => !cancelled && setCompletedSet(new Set()))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  const statuses = useMemo(() => deriveStatuses(completedSet), [completedSet])

  if (loading) return <FullScreenLoader />

  const toggle = async (nodeId, status) => {
    if (status === 'locked') return
    const next = status !== 'completed'
    setCompletedSet((prev) => {
      const copy = new Set(prev)
      if (next) copy.add(nodeId)
      else copy.delete(nodeId)
      return copy
    })
    try {
      await setSkillCompleted(user.uid, nodeId, next)
    } catch {
      setCompletedSet((prev) => {
        const copy = new Set(prev)
        if (next) copy.delete(nodeId)
        else copy.add(nodeId)
        return copy
      })
    }
  }

  const completedCount = completedSet.size

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Skill tree</h1>
        <p className="muted">
          {completedCount} skills unlocked. Mark a skill complete to unlock what
          comes next.
        </p>
      </header>

      {SKILL_BRANCHES.map((branch) => (
        <section key={branch.id} className="skill-branch">
          <h2 className="section-title">{branch.title}</h2>
          <ul className="skill-list">
            {branch.nodes.map((node) => {
              const status = statuses[node.id]
              return (
                <li
                  key={node.id}
                  className={`card skill-node skill-node--${status}`}
                >
                  <div className="skill-node__main">
                    <div className="skill-node__head">
                      <span className="skill-node__name">{node.name}</span>
                      <span className={`skill-status skill-status--${status}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <p className="skill-node__desc muted">{node.description}</p>
                  </div>
                  <button
                    className={'btn btn--sm' + (status === 'completed' ? '' : ' btn--primary')}
                    onClick={() => toggle(node.id, status)}
                    disabled={status === 'locked'}
                  >
                    {status === 'completed' ? 'Undo' : status === 'locked' ? 'Locked' : 'Complete'}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
