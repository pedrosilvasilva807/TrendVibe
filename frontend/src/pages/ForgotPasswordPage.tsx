import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'

export function ForgotPasswordPage(): JSX.Element {
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSent(true)
      addToast('E-mail de recuperação enviado', 'success')
    } catch (error) {
      console.error('Forgot password failed', error)
      addToast('Falha ao enviar e-mail de recuperação', 'error')
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
        <h1 className="mb-2 text-center text-2xl font-bold text-escuro dark:text-darkText">Recuperar senha</h1>
        <p className="mb-6 text-center text-sm text-cinza">
          Digite seu e-mail para receber o link de redefinição.
        </p>
        {sent ? (
          <div className="text-center">
            <p className="mb-4 text-sm text-escuro dark:text-darkText">
              Se o e-mail existir, você receberá instruções em breve.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-azul hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar para o login
            </Link>
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-ciano to-azul py-3 text-sm font-bold text-white shadow-sm hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-cinza">
          <Link to="/login" className="inline-flex items-center gap-2 text-azul hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
