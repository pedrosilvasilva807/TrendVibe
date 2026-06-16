import type { SkeletonProps } from '@/types/components'

export function Skeleton({ className = '' }: SkeletonProps): JSX.Element {
  return (
    <div
      className={`animate-pulse-fast rounded-md bg-slate-200 dark:bg-slate-700 ${className}`}
      aria-hidden="true"
    />
  )
}
