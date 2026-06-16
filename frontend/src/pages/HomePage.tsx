import { useEffect, useCallback } from 'react'
import { PostForm } from '@/components/feed/PostForm'
import { FeedPost } from '@/components/feed/FeedPost'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useFeedStore } from '@/stores/useFeedStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { postsApi } from '@/lib/api'
import { Sparkles, Clock } from 'lucide-react'
import type { FeedSort } from '@/types/components'

export function HomePage(): JSX.Element {
  const { isAuthenticated } = useAuthStore()
  const { posts, isLoading, error, hasMore, sort, setPosts, appendPosts, setLoading, setLoadingMore, setError, setHasMore, setSort, reset } = useFeedStore()

  const loadPosts = useCallback(
    async (cursor?: string) => {
      if (!cursor) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      try {
        const response = await postsApi.list({ sort, cursor, limit: 10 })
        if (cursor) {
          appendPosts(response.data)
        } else {
          setPosts(response.data)
        }
        setHasMore(response.hasMore)
      } catch (err) {
        console.error('Failed to load feed', err)
        setError('Não foi possível carregar o feed.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [sort, setPosts, appendPosts, setHasMore, setError, setLoading, setLoadingMore]
  )

  useEffect(() => {
    reset()
    loadPosts()
  }, [sort])

  function handleSortChange(newSort: FeedSort) {
    setSort(newSort)
  }

  function handleLoadMore() {
    const lastPost = posts[posts.length - 1]
    if (lastPost && hasMore) {
      loadPosts(lastPost.created_at)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-escuro dark:text-darkText">Feed</h1>
        <div className="flex rounded-xl bg-white p-1 shadow-sm dark:bg-darkSurface">
          <button
            type="button"
            onClick={() => handleSortChange('recent')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
              sort === 'recent' ? 'bg-azul text-white' : 'text-cinza hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="h-4 w-4" /> Recentes
          </button>
          <button
            type="button"
            onClick={() => handleSortChange('trending')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
              sort === 'trending' ? 'bg-violeta text-white' : 'text-cinza hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4" /> Trending
          </button>
        </div>
      </div>

      {isAuthenticated && <PostForm />}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!isLoading && error && <ErrorMessage message={error} onRetry={() => loadPosts()} />}

      {!isLoading && !error && posts.length === 0 && (
        <EmptyState
          title="Nenhum post ainda"
          description="Siga pessoas ou entre em comunidades para começar."
          icon={<Sparkles className="h-10 w-10" />}
        />
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>

      {hasMore && !isLoading && (
        <button
          type="button"
          onClick={handleLoadMore}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-cinza hover:bg-white dark:border-slate-800 dark:hover:bg-darkSurface"
        >
          Carregar mais
        </button>
      )}
    </div>
  )
}
