import { useState } from 'react'
import { Image, Video, Send } from 'lucide-react'
import { postsApi } from '@/lib/api'
import { useFeedStore } from '@/stores/useFeedStore'
import { useToast } from '@/components/ui/Toast'
import { isValidMediaUrl } from '@/utils/format'
import type { PostFormProps } from '@/types/components'
import type { Post } from '@/types/database'

export function PostForm({ communityId, onSuccess }: PostFormProps): JSX.Element {
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { prependPost } = useFeedStore()
  const { addToast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedContent = content.trim()
    if (trimmedContent.length === 0 && mediaUrl.length === 0) {
      addToast('Escreva algo ou adicione uma mídia', 'error')
      return
    }
    if (trimmedContent.length > 500) {
      addToast('O post deve ter no máximo 500 caracteres', 'error')
      return
    }
    const mediaType = mediaUrl ? isValidMediaUrl(mediaUrl) : null
    if (mediaUrl && !mediaType) {
      addToast('URL de mídia inválida. Use uma imagem ou vídeo.', 'error')
      return
    }

    setIsLoading(true)
    try {
      const post = await postsApi.create({
        content: trimmedContent,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
        communityId,
      })
      prependPost(post as Post)
      setContent('')
      setMediaUrl('')
      onSuccess?.()
      addToast('Post publicado', 'success')
    } catch (error) {
      console.error('Failed to create post', error)
      addToast('Falha ao publicar. Tente novamente.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-darkSurface">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="O que está em alta?"
        maxLength={500}
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 bg-surface p-3 text-escuro placeholder:text-cinza/60 focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Image className="absolute left-3 h-4 w-4 text-cinza" />
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL de imagem ou vídeo"
              className="rounded-lg border border-slate-200 bg-surface py-2 pl-9 pr-3 text-sm text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
            />
          </div>
          <span className="text-xs text-cinza">
            <Video className="inline h-4 w-4" /> Imagem/Vídeo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-cinza">{content.length}/500</span>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-ciano to-azul px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isLoading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </form>
  )
}
