import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import { supabase, getCurrentSession } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import { generateKeyPair, exportPublicKey } from '@/lib/crypto'
import { chatApi } from '@/lib/api'

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!displayName.trim()) {
      addToast('Por favor, insira seu nome', 'error')
      return
    }
    if (!username.trim()) {
      addToast('Por favor, insira seu nome de usuário', 'error')
      return
    }
    if (password !== confirmPassword) {
      addToast('As senhas não coincidem', 'error')
      return
    }
    if (password.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres', 'error')
      return
    }
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (!data.user) throw new Error('User not created')
      setUser(data.user)
      // Ensure we have a session token before calling backend
      let token = data.session?.access_token
      if (!token) {
        // Try getting current session from client
        const current = await getCurrentSession().catch(() => null)
        token = current?.access_token
      }
      if (!token) {
        // Fallback: attempt to sign in immediately
        try {
          const signIn = await supabase.auth.signInWithPassword({ email, password })
          token = signIn.data.session?.access_token
        } catch (e) {
          // ignore; we'll surface error if profile call fails
        }
      }

      // Create/update profile with display name and username
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      console.log('RegisterPage: sending profile data to', `${apiUrl}/profiles`)
      const profileResp = await fetch(`${apiUrl}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ displayName: displayName, username }),
      })
      console.log('RegisterPage: profile response status=', profileResp.status)
      if (!profileResp.ok) {
        const text = await profileResp.text()
        console.error('RegisterPage: profile response error=', text)
        throw new Error(text)
      }
      const profileData = await profileResp.json()
      console.log('RegisterPage: profile created successfully=', profileData)
      const publicKey = await generateKeyPair(data.user.id)
      const exported = await exportPublicKey(publicKey)
      await chatApi.savePublicKey(exported)
      // After signup, direct user to edit profile to complete details
      navigate('/edit-profile')
      addToast('Conta criada com sucesso', 'success')
    } catch (error) {
      console.error('Registration failed', error)
      addToast('Falha ao criar conta. Tente novamente.', 'error')
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
        <h1 className="mb-6 text-center text-2xl font-bold text-escuro dark:text-darkText">Criar conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
              Nome completo
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-3 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
              placeholder="Seu nome completo"
            />
          </div>
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
              Nome de usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-3 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
              placeholder="@seu_usuario"
            />
          </div>
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
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-3 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-ciano to-azul py-3 text-sm font-bold text-white shadow-sm hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-cinza">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-azul hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}
