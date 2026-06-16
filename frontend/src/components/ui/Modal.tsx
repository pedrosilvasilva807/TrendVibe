import { X } from 'lucide-react'
import { useEffect } from 'react'
import type { ModalProps } from '@/types/components'

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps): JSX.Element | null {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-darkSurface">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-escuro dark:text-darkText">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-cinza hover:text-escuro dark:hover:text-darkText"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
