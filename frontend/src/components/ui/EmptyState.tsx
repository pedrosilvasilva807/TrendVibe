import type { EmptyStateProps } from '@/types/components'

export function EmptyState({ title, description, icon, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cinza/30 bg-surface p-8 text-center dark:bg-darkSurface">
      {icon && <div className="mb-4 text-cinza">{icon}</div>}
      <h3 className="text-lg font-semibold text-escuro dark:text-darkText">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-cinza">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
