import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CommunityDetail } from '@/components/community/CommunityDetail'
import { PostForm } from '@/components/feed/PostForm'
import { FeedPost } from '@/components/feed/FeedPost'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { EmptyState } from '@/components/ui/EmptyState'
import { communitiesApi } from '@/lib/api'
import { useCommunityStore } from '@/stores/useCommunityStore'
import { useToast } from '@/components/ui/Toast'
import type { Community } from '@/types/database'
import type { Post } from '@/types/database'

export function CommunityPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { addToast } = useToast()
  const { setSelectedCommunity } = useCommunityStore()
  const [community, setCommunity] = useState<Community | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [postsLoading, setPostsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  async function loadCommunity() {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await communitiesApi.getById(id)
      setCommunity(response.community)
      setSelectedCommunity(response.community)
      setIsMember(response.community.is_member || false)
    } catch (err) {
      console.error('Failed to load community', err)
      setError('Não foi possível carregar a comunidade.')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadPosts(cursor?: string) {
    if (!id) return
    setPostsLoading(true)
    try {
      const response = await communitiesApi.getPosts(id, cursor, 10)
      if (cursor) {
        setPosts((prev) => [...prev, ...response.data])
      } else {
        setPosts(response.data)
      }
      setHasMore(response.hasMore)
    } catch (err) {
      console.error('Failed to load community posts', err)
      addToast('Não foi possível carregar os posts', 'error')
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    loadCommunity()
    loadPosts()
  }, [id])

  async function handleJoinToggle() {
    if (!community) return
    const newState = !isMember
    setIsMember(newState)
    try {
      if (newState) {
        await communitiesApi.join(community.id)
        addToast(`Você entrou em ${community.title}`, 'success')
      } else {
        await communitiesApi.leave(community.id)
        addToast(`Você saiu de ${community.title}`, 'info')
      }
      await loadCommunity()
    } catch (err) {
      console.error('Failed to toggle membership', err)
      setIsMember(!newState)
      addToast('Não foi possível atualizar sua participação', 'error')
    }
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (error || !community) {
    return <ErrorMessage title="Comunidade não encontrada" message={error || 'Não foi possível carregar.'} onRetry={loadCommunity} />
  }

  return (
    <div className="space-y-6">
      <CommunityDetail community={community} isMember={isMember} onJoinToggle={handleJoinToggle} />
      {isMember && <PostForm communityId={community.id} onSuccess={() => loadPosts()} />}
      <h2 className="text-xl font-bold text-escuro dark:text-darkText">Posts da comunidade</h2>
      {postsLoading && posts.length === 0 && <Skeleton className="h-40 w-full" />}
      {!postsLoading && posts.length === 0 && (
        <EmptyState title="Nenhum post ainda" description="Seja o primeiro a publicar nesta comunidade." />
      )}
      <div className="space-y-4">
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>
      {hasMore && !postsLoading && (
        <button
          type="button"
          onClick={() => {
            const last = posts[posts.length - 1]
            if (last) loadPosts(last.created_at)
          }}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-cinza hover:bg-white dark:border-slate-800 dark:hover:bg-darkSurface"
        >
          Carregar mais
        </button>
      )}
    </div>
  )
}
