import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ErrorMessageProps } from '@/types/components'

export function ErrorMessage({ title = 'Algo deu errado', message, onRetry }: ErrorMessageProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-500" />
      <h3 className="font-semibold text-red-700 dark:text-red-400">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-red-600 dark:text-red-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
