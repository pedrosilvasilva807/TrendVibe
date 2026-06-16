import { create } from 'zustand'
import type { Community } from '@/types/database'

interface CommunityState {
  communities: Community[]
  myCommunities: Community[]
  selectedCommunity: Community | null
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  cursor: string | null
  setCommunities: (communities: Community[]) => void
  appendCommunities: (communities: Community[]) => void
  setMyCommunities: (myCommunities: Community[]) => void
  updateCommunityMembership: (communityId: string, isMember: boolean) => void
  setSelectedCommunity: (community: Community | null) => void
  updateSelectedCommunity: (community: Community) => void
  setLoading: (loading: boolean) => void
  setLoadingMore: (loading: boolean) => void
  setError: (error: string | null) => void
  setHasMore: (hasMore: boolean) => void
  setCursor: (cursor: string | null) => void
  reset: () => void
}

const initialState = {
  communities: [],
  myCommunities: [],
  selectedCommunity: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: true,
  cursor: null,
}

export const useCommunityStore = create<CommunityState>()((set) => ({
  ...initialState,
  setCommunities: (communities: Community[]) => set({ communities }),
  appendCommunities: (communities: Community[]) =>
    set((state) => ({
      communities: [...state.communities, ...communities],
    })),
  setMyCommunities: (myCommunities: Community[]) => set({ myCommunities }),
  updateCommunityMembership: (communityId: string, isMember: boolean) =>
    set((state) => ({
      communities: state.communities.map((c) =>
        c.id === communityId ? { ...c, is_member: isMember } : c
      ),
      myCommunities: isMember
        ? [...state.myCommunities, state.communities.find((c) => c.id === communityId)!].filter(Boolean)
        : state.myCommunities.filter((c) => c.id !== communityId),
      selectedCommunity:
        state.selectedCommunity?.id === communityId
          ? { ...state.selectedCommunity, is_member: isMember }
          : state.selectedCommunity,
    })),
  setSelectedCommunity: (selectedCommunity: Community | null) => set({ selectedCommunity }),
  updateSelectedCommunity: (community: Community) =>
    set((state) => ({
      selectedCommunity: state.selectedCommunity?.id === community.id ? community : state.selectedCommunity,
    })),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setLoadingMore: (isLoadingMore: boolean) => set({ isLoadingMore }),
  setError: (error: string | null) => set({ error }),
  setHasMore: (hasMore: boolean) => set({ hasMore }),
  setCursor: (cursor: string | null) => set({ cursor }),
  reset: () => set(initialState),
}))
