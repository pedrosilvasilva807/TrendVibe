import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { communitiesApi } from '@/lib/api'
import { useCommunityStore } from '@/stores/useCommunityStore'
import { useToast } from '@/components/ui/Toast'
import type { CommunityCardProps } from '@/types/components'

export function CommunityCard({ community, onJoinToggle }: CommunityCardProps): JSX.Element {
  const { updateCommunityMembership } = useCommunityStore()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    setIsLoading(true)
    try {
      if (community.is_member) {
        await communitiesApi.leave(community.id)
        updateCommunityMembership(community.id, false)
        addToast(`Você saiu de ${community.title}`, 'info')
      } else {
        await communitiesApi.join(community.id)
        updateCommunityMembership(community.id, true)
        addToast(`Você entrou em ${community.title}`, 'success')
      }
      onJoinToggle?.(community)
    } catch (error) {
      console.error('Failed to toggle membership', error)
      addToast('Não foi possível atualizar sua participação', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-darkSurface">
      <div className="flex items-start gap-4">
        <Avatar url={community.image_url} alt={community.title} size="lg" className="rounded-xl" />
        <div className="flex-1">
          <Link to={`/community/${community.id}`} className="text-lg font-bold text-escuro hover:text-azul dark:text-darkText">
            {community.title}
          </Link>
          <p className="text-xs text-cinza">{community.category}</p>
          <p className="mt-2 line-clamp-2 text-sm text-escuro dark:text-darkText">{community.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-cinza">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {community.members_count} membros
            </span>
            <span>{community.posts_count} posts</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={`mt-4 w-full rounded-xl py-2 text-sm font-semibold transition-colors ${
          community.is_member
            ? 'border border-slate-200 text-cinza hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
            : 'bg-gradient-to-r from-ciano to-azul text-white hover:from-cyan-600 hover:to-blue-700'
        }`}
      >
        {isLoading ? 'Carregando...' : community.is_member ? 'Sair' : 'Entrar'}
      </button>
    </div>
  )
}
