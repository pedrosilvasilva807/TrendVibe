import { Link } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

export function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-4 text-center dark:bg-escuro">
      <AlertTriangle className="mb-4 h-16 w-16 text-cinza" />
      <h1 className="text-4xl font-bold text-escuro dark:text-darkText">404</h1>
      <p className="mt-2 text-cinza">Página não encontrada.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-ciano to-azul px-6 py-3 text-sm font-bold text-white shadow-sm hover:from-cyan-600 hover:to-blue-700"
      >
        <Home className="h-4 w-4" /> Voltar para o feed
      </Link>
    </div>
  )
}
