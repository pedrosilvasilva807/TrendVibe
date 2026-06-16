import { create } from 'zustand'
import type { Post } from '@/types/database'
import type { FeedSort } from '@/types/components'

interface FeedState {
  posts: Post[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  cursor: string | null
  sort: FeedSort
  setPosts: (posts: Post[]) => void
  appendPosts: (posts: Post[]) => void
  prependPost: (post: Post) => void
  updatePost: (post: Post) => void
  removePost: (postId: string) => void
  setLoading: (loading: boolean) => void
  setLoadingMore: (loading: boolean) => void
  setError: (error: string | null) => void
  setHasMore: (hasMore: boolean) => void
  setCursor: (cursor: string | null) => void
  setSort: (sort: FeedSort) => void
  reset: () => void
}

const initialState = {
  posts: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: true,
  cursor: null,
  sort: 'recent' as FeedSort,
}

export const useFeedStore = create<FeedState>()((set) => ({
  ...initialState,
  setPosts: (posts: Post[]) => set({ posts }),
  appendPosts: (posts: Post[]) =>
    set((state) => ({
      posts: [...state.posts, ...posts],
    })),
  prependPost: (post: Post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),
  updatePost: (post: Post) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === post.id ? post : p)),
    })),
  removePost: (postId: string) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    })),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setLoadingMore: (isLoadingMore: boolean) => set({ isLoadingMore }),
  setError: (error: string | null) => set({ error }),
  setHasMore: (hasMore: boolean) => set({ hasMore }),
  setCursor: (cursor: string | null) => set({ cursor }),
  setSort: (sort: FeedSort) => set({ sort }),
  reset: () => set(initialState),
}))
