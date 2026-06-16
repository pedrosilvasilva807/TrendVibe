import { create } from 'zustand'
import type { UserProfile } from '@/types/database'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  isFollowing: boolean
  followers: UserProfile[]
  following: UserProfile[]
  isLoadingFollowers: boolean
  isLoadingFollowing: boolean
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setIsFollowing: (isFollowing: boolean) => void
  setFollowers: (followers: UserProfile[]) => void
  setFollowing: (following: UserProfile[]) => void
  setLoadingFollowers: (loading: boolean) => void
  setLoadingFollowing: (loading: boolean) => void
  updateFollowers: (profile: UserProfile, isFollowing: boolean) => void
  reset: () => void
}

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  isFollowing: false,
  followers: [],
  following: [],
  isLoadingFollowers: false,
  isLoadingFollowing: false,
}

export const useProfileStore = create<ProfileState>()((set) => ({
  ...initialState,
  setProfile: (profile: UserProfile | null) => set({ profile }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setIsFollowing: (isFollowing: boolean) => set({ isFollowing }),
  setFollowers: (followers: UserProfile[]) => set({ followers }),
  setFollowing: (following: UserProfile[]) => set({ following }),
  setLoadingFollowers: (isLoadingFollowers: boolean) => set({ isLoadingFollowers }),
  setLoadingFollowing: (isLoadingFollowing: boolean) => set({ isLoadingFollowing }),
  updateFollowers: (profile: UserProfile, isFollowing: boolean) =>
    set((state) => ({
      isFollowing,
      followers: isFollowing
        ? [...state.followers, profile]
        : state.followers.filter((f) => f.id !== profile.id),
      profile: state.profile
        ? { ...state.profile, followers_count: isFollowing ? state.profile.followers_count + 1 : Math.max(0, state.profile.followers_count - 1) }
        : null,
    })),
  reset: () => set(initialState),
}))
