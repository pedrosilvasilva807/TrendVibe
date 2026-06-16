import { UserPlus, UserMinus } from 'lucide-react'
import type { FollowButtonProps } from '@/types/components'

export function FollowButton({ isFollowing, onToggle, isLoading = false }: FollowButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
        isFollowing
          ? 'border border-slate-200 text-cinza hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
          : 'bg-gradient-to-r from-ciano to-azul text-white hover:from-cyan-600 hover:to-blue-700'
      }`}
      aria-label={isFollowing ? 'Deixar de seguir' : 'Seguir'}
    >
      {isLoading ? (
        'Carregando...'
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" /> Seguindo
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" /> Seguir
        </>
      )}
    </button>
  )
}
