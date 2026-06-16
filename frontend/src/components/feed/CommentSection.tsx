import { useEffect, useState } from 'react'
import { Send, Pencil, Trash2 } from 'lucide-react'
import { commentsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { formatRelativeTime } from '@/utils/format'
import type { CommentSectionProps } from '@/types/components'
import type { Comment } from '@/types/database'

export function CommentSection({ postId }: CommentSectionProps): JSX.Element {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  async function loadComments() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await commentsApi.list(postId, undefined, 50)
      setComments(response.data)
    } catch (err) {
      console.error('Failed to load comments', err)
      setError('Não foi possível carregar os comentários.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [postId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = newComment.trim()
    if (trimmed.length === 0) {
      addToast('Escreva um comentário', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      const comment = await commentsApi.create({ postId, content: trimmed })
      setComments((prev) => [comment as unknown as Comment, ...prev])
      setNewComment('')
    } catch (err) {
      console.error('Failed to create comment', err)
      addToast('Falha ao comentar', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(commentId: string) {
    const trimmed = editContent.trim()
    if (trimmed.length === 0) {
      addToast('Comentário não pode ficar vazio', 'error')
      return
    }
    try {
      const updated = await commentsApi.update(commentId, { content: trimmed })
      setComments((prev) => prev.map((c) => (c.id === commentId ? (updated as unknown as Comment) : c)))
      setEditingId(null)
      setEditContent('')
      addToast('Comentário atualizado', 'success')
    } catch (err) {
      console.error('Failed to update comment', err)
      addToast('Falha ao atualizar comentário', 'error')
    }
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm('Excluir comentário?')) return
    try {
      await commentsApi.delete(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      addToast('Comentário excluído', 'success')
    } catch (err) {
      console.error('Failed to delete comment', err)
      addToast('Falha ao excluir comentário', 'error')
    }
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
      {user && (
        <form onSubmit={handleSubmit} className="mb-4 flex items-start gap-3">
          <Avatar url={user?.user_metadata?.avatar_url} alt="Você" size="sm" />
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 rounded-full border border-slate-200 bg-surface px-4 py-2 text-sm text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-azul p-2 text-white hover:bg-blue-700 disabled:opacity-50"
              aria-label="Enviar comentário"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && error && <ErrorMessage message={error} onRetry={loadComments} />}

      {!isLoading && !error && comments.length === 0 && (
        <EmptyState title="Nenhum comentário ainda" description="Seja o primeiro a comentar." />
      )}

      <div className="space-y-3">
        {comments.map((comment) => {
          const isOwner = user?.id === comment.user_id
          const isEditing = editingId === comment.id

          return (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar url={comment.author?.avatar_url} alt={comment.author?.display_name || 'Usuário'} size="sm" />
              <div className="flex-1">
                <div className="rounded-2xl bg-surface px-4 py-2 dark:bg-escuro">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-escuro dark:text-darkText">
                      {comment.author?.display_name || 'Usuário'}
                    </span>
                    <span className="text-xs text-cinza">{formatRelativeTime(comment.created_at)}</span>
                  </div>
                  {isEditing ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1 text-sm dark:border-slate-800 dark:bg-darkSurface"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdate(comment.id)}
                        className="text-sm font-medium text-azul hover:underline"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-sm text-cinza hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-escuro dark:text-darkText">{comment.content}</p>
                  )}
                </div>
                {isOwner && !isEditing && (
                  <div className="mt-1 flex items-center gap-3 pl-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditContent(comment.content)
                      }}
                      className="text-xs text-cinza hover:text-azul"
                    >
                      <Pencil className="inline h-3 w-3" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-cinza hover:text-red-500"
                    >
                      <Trash2 className="inline h-3 w-3" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
