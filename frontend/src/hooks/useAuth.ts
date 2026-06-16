import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { supabase, getCurrentSession } from '@/lib/supabase'
import { authApi } from '@/lib/api'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const { user, profile, isAuthenticated, isLoading, setUser, setProfile, setLoading, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        const session = await getCurrentSession().catch(() => null)
        if (!isMounted) return

        if (session?.user) {
          setUser(session.user)
          try {
            const response = await authApi.me()
            setProfile(response.user)
            // If profile exists but username missing, force edit-profile
            if (!response.user.username) {
              navigate('/edit-profile')
            }
          } catch (error) {
            console.error('Failed to load profile in useAuth', error)
            clearAuth()
          }
        } else {
          clearAuth()
        }
      } catch (error) {
        console.error('Auth initialization error', error)
        clearAuth()
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      const currentUser: User | null = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        try {
          // Use the session provided by the auth state change to avoid a
          // race where `supabase.auth.getSession()` isn't yet populated.
          const apiUrl = import.meta.env.VITE_API_URL || '/api'
          const token = session?.access_token
          const resp = await fetch(`${apiUrl}/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          })
          if (!resp.ok) throw new Error(await resp.text())
          const body = await resp.json()
          setProfile(body.data.user)
          if (!body.data.user.username) {
            navigate('/edit-profile')
          }
        } catch (error) {
          console.error('Failed to load profile on auth change', error)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [setUser, setProfile, setLoading, clearAuth])

  return { user, profile, isAuthenticated, isLoading }
}
