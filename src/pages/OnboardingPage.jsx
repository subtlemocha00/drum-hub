import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth.js'
import { useProfile } from '../features/profile/useProfile.js'
import { saveOnboarding } from '../features/profile/profileService.js'
import {
  EXPERIENCE_LEVELS,
  PRIMARY_GOALS,
  PRACTICE_FREQUENCIES,
  recommendStartingPlan
} from '../data/recommendations.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function OptionGroup({ legend, options, value, onChange }) {
  return (
    <fieldset className="onboard-group">
      <legend className="section-title">{legend}</legend>
      <div className="onboard-options">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={'onboard-option' + (value === opt.value ? ' onboard-option--active' : '')}
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** Short, rules-based onboarding to personalize the experience. */
export function OnboardingPage() {
  useDocumentTitle('Welcome')
  const { user } = useAuth()
  const { onboarded, refresh } = useProfile()
  const navigate = useNavigate()

  const [experienceLevel, setExperienceLevel] = useState(null)
  const [primaryGoal, setPrimaryGoal] = useState(null)
  const [practiceFrequency, setPracticeFrequency] = useState(null)
  const [saving, setSaving] = useState(false)

  // Already set up — skip the flow.
  if (onboarded) return <Navigate to="/dashboard" replace />

  const ready = experienceLevel && primaryGoal && practiceFrequency

  const finish = async () => {
    setSaving(true)
    try {
      await saveOnboarding(user.uid, { experienceLevel, primaryGoal, practiceFrequency })
      await refresh()
      const plan = recommendStartingPlan({ experienceLevel, primaryGoal, practiceFrequency })
      navigate(plan ? `/plans/${plan.id}` : '/dashboard', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        <header className="onboard-head">
          <span className="app-header__logo" aria-hidden="true">◉</span>
          <h1>Welcome to Drum Hub</h1>
          <p className="muted">Three quick questions to tailor your practice.</p>
        </header>

        <OptionGroup
          legend="What's your experience level?"
          options={EXPERIENCE_LEVELS}
          value={experienceLevel}
          onChange={setExperienceLevel}
        />
        <OptionGroup
          legend="What's your main goal?"
          options={PRIMARY_GOALS}
          value={primaryGoal}
          onChange={setPrimaryGoal}
        />
        <OptionGroup
          legend="How often will you practice?"
          options={PRACTICE_FREQUENCIES}
          value={practiceFrequency}
          onChange={setPracticeFrequency}
        />

        <button
          className="btn btn--primary btn--lg btn--block"
          onClick={finish}
          disabled={!ready || saving}
        >
          {saving ? 'Setting up…' : 'Start practicing'}
        </button>
      </div>
    </div>
  )
}
