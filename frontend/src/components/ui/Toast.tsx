import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import type { Toast as ToastType, ToastContextValue, ChildrenProps } from '@/types/components'

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: ChildrenProps): JSX.Element {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType['type'] = 'info', duration = 5000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setToasts((prev) => [...prev, { id, message, type, duration }])
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
    },
    [removeToast]
  )

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastItem({ toast, onClose }: { toast: ToastType; onClose: (id: string) => void }): JSX.Element {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-azul" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  }

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900',
    error: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
    info: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
  }

  return (
    <div
      className={`flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm ${bgColors[toast.type]}`}
      role="alert"
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-escuro dark:text-darkText">{toast.message}</p>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="text-cinza hover:text-escuro dark:hover:text-darkText"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
