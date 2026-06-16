import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { PostActions } from './PostActions'
import { CommentSection } from './CommentSection'
import { formatRelativeTime } from '@/utils/format'
import { postsApi } from '@/lib/api'
import { useFeedStore } from '@/stores/useFeedStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import type { FeedPostProps } from '@/types/components'
import type { Post } from '@/types/database'

export function FeedPost({ post, onDelete }: FeedPostProps): JSX.Element {
  const { user } = useAuthStore()
  const { updatePost, removePost } = useFeedStore()
  const { addToast } = useToast()
  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isOwner = user?.id === post.user_id

  async function handleSaveEdit() {
    if (editContent.trim().length === 0) {
      addToast('O post não pode ficar vazio', 'error')
      return
    }
    setIsSaving(true)
    try {
      const updated = await postsApi.update(post.id, { content: editContent })
      updatePost(updated as Post)
      setIsEditing(false)
      addToast('Post atualizado', 'success')
    } catch (error) {
      console.error('Failed to update post', error)
      addToast('Falha ao atualizar post', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) {
      return
    }
    setIsDeleting(true)
    try {
      await postsApi.delete(post.id)
      removePost(post.id)
      onDelete?.(post.id)
      addToast('Post excluído', 'success')
    } catch (error) {
      console.error('Failed to delete post', error)
      addToast('Falha ao excluir post', 'error')
      setIsDeleting(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-darkSurface sm:p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={post.author?.username ? `/profile/${post.author.username}` : '/'}>
            <Avatar url={post.author?.avatar_url} alt={post.author?.display_name || 'Usuário'} size="md" />
          </Link>
          <div>
            <Link
              to={post.author?.username ? `/profile/${post.author.username}` : '/'}
              className="font-semibold text-escuro hover:text-azul dark:text-darkText"
            >
              {post.author?.display_name || 'Usuário'}
            </Link>
            <p className="text-xs text-cinza">
              {post.author?.username ? `@${post.author.username}` : ''} · {formatRelativeTime(post.created_at)}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full p-2 text-cinza hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Opções do post"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-darkSurface">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true)
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-escuro hover:bg-slate-100 dark:text-darkText dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" /> {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-slate-200 bg-surface p-3 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-cinza hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="rounded-lg bg-azul px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-escuro dark:text-darkText">{post.content}</p>
        )}

        {post.media_url && (
          <div className="mt-3 overflow-hidden rounded-xl">
            {post.media_type === 'video' ? (
              <video src={post.media_url} controls className="w-full max-h-[500px] bg-black" />
            ) : (
              <img src={post.media_url} alt="Mídia do post" className="w-full max-h-[500px] object-cover" loading="lazy" />
            )}
          </div>
        )}

        {post.community && (
          <Link
            to={`/community/${post.community.id}`}
            className="mt-3 inline-block rounded-full bg-gradient-to-r from-ciano/10 to-violeta/10 px-3 py-1 text-xs font-medium text-azul"
          >
            {post.community.title}
          </Link>
        )}
      </div>

      <PostActions post={post} onCommentClick={() => setShowComments(!showComments)} />

      {showComments && <CommentSection postId={post.id} />}
    </article>
  )
}
