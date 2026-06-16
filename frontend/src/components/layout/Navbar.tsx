import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, MessageSquare, Bell, LogOut, Menu } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/ui/Avatar'
import { ThemeToggle } from './ThemeToggle'
import { useToast } from '@/components/ui/Toast'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps): JSX.Element {
  const { profile, isAuthenticated } = useAuthStore()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      useAuthStore.getState().clearAuth()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed', error)
      addToast('Falha ao sair. Tente novamente.', 'error')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-escuro/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-cinza hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="hidden text-xl font-bold text-brand sm:inline">TrendVibe</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {isAuthenticated && (
            <>
              <Link
                to="/chat"
                className="relative rounded-full p-2 text-cinza transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Mensagens"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>
              <button
                type="button"
                className="relative rounded-full p-2 text-cinza transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5" />
              </button>
              <Link to={profile?.username ? `/profile/${profile.username}` : '/edit-profile'} className="flex items-center gap-2">
                <Avatar url={profile?.avatar_url} alt={profile?.display_name || 'Perfil'} size="sm" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full p-2 text-cinza transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
