import { NavLink } from 'react-router-dom'
import { Home, Compass, Users, PlusSquare } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Avatar } from '@/components/ui/Avatar'

const navItems = [
  { to: '/', icon: Home, label: 'Feed' },
  { to: '/explore', icon: Compass, label: 'Explorar' },
  { to: '/communities', icon: Users, label: 'Comunidades' },
  { to: '/create-community', icon: PlusSquare, label: 'Nova Comunidade' },
]

export function Sidebar(): JSX.Element {
  const { profile } = useAuthStore()

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-surface p-4 dark:border-slate-800 dark:bg-darkSurface lg:flex">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-ciano/10 to-azul/10 text-azul'
                  : 'text-cinza hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to={profile?.username ? `/profile/${profile.username}` : '/edit-profile'}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-ciano/10 to-azul/10 text-azul'
                : 'text-cinza hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`
          }
        >
          <Avatar url={profile?.avatar_url} alt={profile?.display_name || 'Perfil'} size="sm" />
          Perfil
        </NavLink>
      </nav>

      <div className="mt-auto rounded-xl bg-white p-4 shadow-sm dark:bg-escuro">
        <p className="text-xs font-semibold text-cinza">Comunidades em alta</p>
        <div className="mt-2 text-sm text-escuro dark:text-darkText">Em breve...</div>
      </div>
    </aside>
  )
}
