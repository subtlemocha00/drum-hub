import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuth } from '../auth/useAuth.js'
import { ProfileContext } from './ProfileContext.js'
import { getProfile } from './profileService.js'

/**
 * Loads the user's profile once so the onboarding gate and dashboard can share
 * it (no duplicate reads). `onboarded` is true once onboarding answers exist.
 */
export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setProfile(await getProfile(user.uid))
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(
    () => ({ profile, loading, refresh: load, onboarded: !!profile?.experienceLevel }),
    [profile, loading, load]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}
