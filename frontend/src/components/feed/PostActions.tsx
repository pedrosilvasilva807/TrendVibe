import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import { postsApi } from '@/lib/api'
import { useFeedStore } from '@/stores/useFeedStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import type { PostActionsProps } from '@/types/components'

export function PostActions({ post, onCommentClick }: PostActionsProps): JSX.Element {
  const { user } = useAuthStore()
  const { updatePost } = useFeedStore()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [liked, setLiked] = useState(post.has_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count)

  async function handleLike() {
    if (!user) {
      addToast('Faça login para curtir publicações', 'info')
      return
    }
    if (isLoading) return

    setIsLoading(true)
    const previousLiked = liked
    const previousCount = likesCount
    setLiked(!liked)
    setLikesCount(liked ? Math.max(0, likesCount - 1) : likesCount + 1)

    try {
      const result = await postsApi.like(post.id)
      setLiked(result.liked)
      setLikesCount(result.likesCount)
      updatePost({ ...post, likes_count: result.likesCount, has_liked: result.liked })
    } catch (error) {
      console.error('Failed to toggle like', error)
      addToast('Não foi possível curtir. Tente novamente.', 'error')
      setLiked(previousLiked)
      setLikesCount(previousCount)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
      addToast('Link copiado para a área de transferência', 'success')
    } catch (error) {
      console.error('Failed to copy share link', error)
      addToast('Não foi possível copiar o link', 'error')
    }
  }

  return (
    <div className="mt-4 flex items-center gap-6 border-t border-slate-100 pt-3 dark:border-slate-800">
      <button
        type="button"
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-2 text-sm font-medium transition-colors ${
          liked ? 'text-red-500' : 'text-cinza hover:text-red-500'
        }`}
        aria-label={liked ? 'Descurtir' : 'Curtir'}
      >
        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
        {likesCount}
      </button>
      <button
        type="button"
        onClick={onCommentClick}
        className="flex items-center gap-2 text-sm font-medium text-cinza transition-colors hover:text-azul"
        aria-label="Comentar"
      >
        <MessageCircle className="h-5 w-5" />
        {post.comments_count}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="ml-auto flex items-center gap-2 text-sm font-medium text-cinza transition-colors hover:text-ciano"
        aria-label="Compartilhar"
      >
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  )
}
