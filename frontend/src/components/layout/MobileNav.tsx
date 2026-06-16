import { NavLink } from 'react-router-dom'
import { Home, Compass, Users, PlusSquare, User } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

const navItems = [
  { to: '/', icon: Home, label: 'Feed' },
  { to: '/explore', icon: Compass, label: 'Explorar' },
  { to: '/communities', icon: Users, label: 'Comunidades' },
  { to: '/create-community', icon: PlusSquare, label: 'Nova' },
  { to: '/edit-profile', icon: User, label: 'Perfil' },
]

export function MobileNav(): JSX.Element {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <></>
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-escuro/95 lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-azul' : 'text-cinza'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="sr-only">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
