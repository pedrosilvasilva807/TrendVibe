import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CommunityForm } from '@/components/community/CommunityForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { communitiesApi } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { Community } from '@/types/database'

export function EditCommunityPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { addToast } = useToast()
  const [community, setCommunity] = useState<Community | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadCommunity() {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await communitiesApi.getById(id)
      setCommunity(response.community)
    } catch (err) {
      console.error('Failed to load community for edit', err)
      setError('Não foi possível carregar a comunidade.')
      addToast('Falha ao carregar comunidade', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCommunity()
  }, [id])

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (error || !community) {
    return <ErrorMessage title="Erro" message={error || 'Comunidade não encontrada.'} onRetry={loadCommunity} />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-escuro dark:text-darkText">Editar comunidade</h1>
      <CommunityForm initialData={community} />
    </div>
  )
}
