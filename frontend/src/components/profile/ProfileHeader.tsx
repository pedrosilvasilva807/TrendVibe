import { Link } from 'react-router-dom'
import { Mail, Link as LinkIcon, Calendar } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { FollowButton } from './FollowButton'
import { formatCount } from '@/utils/format'
import { useToast } from '@/components/ui/Toast'
import type { ProfileHeaderProps } from '@/types/components'

export function ProfileHeader({ profile, isOwnProfile, isFollowing, onFollowToggle }: ProfileHeaderProps): JSX.Element {
  const { addToast } = useToast()

  async function handleFollow() {
    try {
      await onFollowToggle()
    } catch (error) {
      console.error('Follow toggle failed', error)
      addToast('Não foi possível atualizar seguidor', 'error')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-darkSurface">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <Avatar url={profile.avatar_url} alt={profile.display_name || 'Perfil'} size="xl" />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-escuro dark:text-darkText">{profile.display_name || 'Sem nome'}</h1>
          <p className="text-cinza">@{profile.username || 'handle'}</p>
          <p className="mt-3 text-escuro dark:text-darkText">{profile.bio || 'Sem biografia'}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-cinza sm:justify-start">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-azul hover:underline"
              >
                <LinkIcon className="h-4 w-4" /> Site
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Ingressou em {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-center gap-6 sm:justify-start">
            <div className="text-center">
              <span className="block text-lg font-bold text-escuro dark:text-darkText">{formatCount(profile.posts_count)}</span>
              <span className="text-xs text-cinza">Posts</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-escuro dark:text-darkText">{formatCount(profile.followers_count)}</span>
              <span className="text-xs text-cinza">Seguidores</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-escuro dark:text-darkText">{formatCount(profile.following_count)}</span>
              <span className="text-xs text-cinza">Seguindo</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-escuro dark:text-darkText">{formatCount(profile.communities_count)}</span>
              <span className="text-xs text-cinza">Comunidades</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 sm:justify-start">
            {isOwnProfile ? (
              <Link
                to="/edit-profile"
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-cinza hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                Editar perfil
              </Link>
            ) : (
              <>
                <FollowButton isFollowing={isFollowing} onToggle={handleFollow} />
                <Link
                  to={`/chat/new/${profile.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-cinza hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <Mail className="h-4 w-4" /> Mensagem
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
