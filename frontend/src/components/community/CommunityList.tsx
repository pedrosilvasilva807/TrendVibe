import { useEffect, useRef, useCallback } from 'react'
import { CommunityCard } from './CommunityCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { CommunityListProps } from '@/types/components'
import { Compass } from 'lucide-react'

export function CommunityList({
  communities,
  isLoading,
  hasMore,
  onLoadMore,
  emptyMessage = 'Nenhuma comunidade encontrada',
}: CommunityListProps): JSX.Element {
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, { rootMargin: '100px' })
    const current = loaderRef.current
    if (current) {
      observer.observe(current)
    }
    return () => {
      if (current) {
        observer.unobserve(current)
      }
      observer.disconnect()
    }
  }, [handleIntersection])

  if (communities.length === 0 && !isLoading) {
    return <EmptyState title={emptyMessage} icon={<Compass className="h-10 w-10" />} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {communities.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
      {isLoading && (
        <>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </>
      )}
      <div ref={loaderRef} className="col-span-full h-4" />
    </div>
  )
}
