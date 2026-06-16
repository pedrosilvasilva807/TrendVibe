import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/components/ui/Toast'

export function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const { setUser, setProfile } = useAuthStore()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setUser(data.user)
      const response = await authApi.me()
      setProfile(response.user)
      navigate('/')
      addToast('Bem-vindo de volta!', 'success')
    } catch (error) {
      console.error('Login failed', error)
      addToast('Falha ao entrar. Verifique suas credenciais.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 dark:bg-escuro">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-darkSurface">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-brand text-white">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-brand">TrendVibe</span>
        </div>
        <h1 className="mb-6 text-center text-2xl font-bold text-escuro dark:text-darkText">Entrar</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-3 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-3 pr-10 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cinza"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-ciano to-azul py-3 text-sm font-bold text-white shadow-sm hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-cinza">
          <Link to="/forgot-password" className="text-azul hover:underline">
            Esqueceu a senha?
          </Link>
        </div>
        <div className="mt-4 text-center text-sm text-cinza">
          Não tem conta?{' '}
          <Link to="/register" className="font-semibold text-azul hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  )
}
