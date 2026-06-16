import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'
import type { ThemeToggleProps } from '@/types/components'

export function ThemeToggle({ className = '' }: ThemeToggleProps): JSX.Element {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`rounded-full p-2 text-cinza transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
