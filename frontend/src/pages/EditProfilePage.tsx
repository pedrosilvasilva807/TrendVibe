import { useEffect, useState } from 'react'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useAuthStore } from '@/stores/useAuthStore'
import { authApi } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { UserProfile } from '@/types/database'

export function EditProfilePage(): JSX.Element {
  const { profile: storedProfile, setProfile } = useAuthStore()
  const { addToast } = useToast()
  const [profile, setLocalProfile] = useState<UserProfile | null>(storedProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadProfile() {
    setIsLoading(true)
    try {
      const response = await authApi.me()
      setLocalProfile(response.user)
      setProfile(response.user)
    } catch (err) {
      console.error('Failed to load profile for edit', err)
      setError('Não foi possível carregar o perfil.')
      addToast('Falha ao carregar perfil', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (storedProfile) {
      setLocalProfile(storedProfile)
    } else {
      loadProfile()
    }
  }, [storedProfile])

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (error || !profile) {
    return <ErrorMessage title="Erro" message={error || 'Perfil não encontrado.'} onRetry={loadProfile} />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-escuro dark:text-darkText">Editar perfil</h1>
      <ProfileEditForm profile={profile} />
    </div>
  )
}
