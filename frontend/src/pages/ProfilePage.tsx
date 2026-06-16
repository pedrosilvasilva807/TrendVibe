import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { FeedPost } from '@/components/feed/FeedPost'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { EmptyState } from '@/components/ui/EmptyState'
import { profilesApi } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { useToast } from '@/components/ui/Toast'
import type { Post } from '@/types/database'

export function ProfilePage(): JSX.Element {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const { profile, setProfile, isFollowing, setIsFollowing, reset } = useProfileStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [postsLoading, setPostsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  async function loadProfile() {
    if (!username) return
    reset()
    setIsLoading(true)
    setError(null)
    try {
      const response = await profilesApi.getByUsername(username)
      setProfile(response.profile)
      if (user && response.profile.id !== user.id) {
        const followResponse = await profilesApi.isFollowing(response.profile.id)
        setIsFollowing(followResponse.isFollowing)
      }
      await loadPosts(response.profile.id)
    } catch (err) {
      console.error('Failed to load profile', err)
      setError('Não foi possível carregar o perfil.')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadPosts(userId: string, cursor?: string) {
    setPostsLoading(true)
    try {
      const response = await profilesApi.posts(userId, cursor, 10)
      if (cursor) {
        setPosts((prev) => [...prev, ...response.data])
      } else {
        setPosts(response.data)
      }
      setHasMore(response.hasMore)
    } catch (err) {
      console.error('Failed to load profile posts', err)
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [username])

  async function handleFollowToggle() {
    if (!profile || !user) return
    try {
      if (isFollowing) {
        await profilesApi.unfollow(profile.id)
        setIsFollowing(false)
        addToast(`Você deixou de seguir ${profile.display_name || 'este usuário'}`, 'info')
      } else {
        await profilesApi.follow(profile.id)
        setIsFollowing(true)
        addToast(`Você seguiu ${profile.display_name || 'este usuário'}`, 'success')
      }
    } catch (err) {
      console.error('Failed to toggle follow', err)
      addToast('Não foi possível atualizar seguidor', 'error')
    }
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (error || !profile) {
    return <ErrorMessage title="Perfil não encontrado" message={error || 'Não foi possível carregar.'} onRetry={loadProfile} />
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
      />
      <h2 className="text-xl font-bold text-escuro dark:text-darkText">Posts</h2>
      {postsLoading && posts.length === 0 && <Skeleton className="h-40 w-full" />}
      {!postsLoading && posts.length === 0 && <EmptyState title="Nenhum post ainda" description="Este usuário ainda não publicou nada." />}
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
            if (last) loadPosts(profile.id, last.created_at)
          }}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-cinza hover:bg-white dark:border-slate-800 dark:hover:bg-darkSurface"
        >
          Carregar mais
        </button>
      )}
    </div>
  )
}
