import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { communitiesApi } from '@/lib/api'
import { useCommunityStore } from '@/stores/useCommunityStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import type { CommunityDetailProps } from '@/types/components'

export function CommunityDetail({ community, isMember, onJoinToggle }: CommunityDetailProps): JSX.Element {
  const { user } = useAuthStore()
  const { updateCommunityMembership } = useCommunityStore()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const isOwner = user?.id === community.created_by

  async function handleToggle() {
    setIsLoading(true)
    try {
      if (isMember) {
        await communitiesApi.leave(community.id)
        updateCommunityMembership(community.id, false)
      } else {
        await communitiesApi.join(community.id)
        updateCommunityMembership(community.id, true)
      }
      await onJoinToggle()
    } catch (error) {
      console.error('Failed to toggle membership', error)
      addToast('Não foi possível atualizar sua participação', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Tem certeza que deseja excluir esta comunidade?')) {
      return
    }
    try {
      await communitiesApi.delete(community.id)
      addToast('Comunidade excluída', 'success')
    } catch (error) {
      console.error('Failed to delete community', error)
      addToast('Falha ao excluir comunidade', 'error')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-darkSurface">
      <Link to="/communities" className="mb-4 inline-flex items-center gap-2 text-sm text-cinza hover:text-azul">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar url={community.image_url} alt={community.title} size="xl" className="rounded-2xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-escuro dark:text-darkText">{community.title}</h1>
          <p className="text-sm text-cinza">{community.category}</p>
          <p className="mt-3 text-escuro dark:text-darkText">{community.description}</p>
          {community.rules && (
            <div className="mt-3 rounded-xl bg-surface p-3 text-sm text-escuro dark:bg-escuro dark:text-darkText">
              <strong>Regras:</strong> {community.rules}
            </div>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-cinza">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {community.members_count} membros
            </span>
            <span>{community.posts_count} posts</span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggle}
              disabled={isLoading}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
                isMember
                  ? 'border border-slate-200 text-cinza hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                  : 'bg-gradient-to-r from-ciano to-azul text-white hover:from-cyan-600 hover:to-blue-700'
              }`}
            >
              {isLoading ? 'Carregando...' : isMember ? 'Sair da comunidade' : 'Entrar na comunidade'}
            </button>
            {isOwner && (
              <>
                <Link
                  to={`/edit-community/${community.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-cinza hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
