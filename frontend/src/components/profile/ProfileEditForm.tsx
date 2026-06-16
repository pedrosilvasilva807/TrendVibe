import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { profilesApi, uploadFile } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import { Avatar } from '@/components/ui/Avatar'
import type { ProfileEditFormProps } from '@/types/components'
import type { UserProfile } from '@/types/database'

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps): JSX.Element {
  const navigate = useNavigate()
  const { setProfile } = useAuthStore()
  const { addToast } = useToast()
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [username, setUsername] = useState(profile.username || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [website, setWebsite] = useState(profile.website || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('Selecione uma imagem válida', 'error')
      return
    }
    setIsUploading(true)
    try {
      const path = `avatars/${profile.id}/${Date.now()}-${file.name}`
      const publicUrl = await uploadFile('avatars', path, file)
      setAvatarUrl(publicUrl)
      addToast('Avatar carregado', 'success')
    } catch (error) {
      console.error('Avatar upload failed', error)
      addToast('Falha ao enviar avatar', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (username.trim().length === 0) {
      addToast('Nome de usuário é obrigatório', 'error')
      return
    }
    setIsLoading(true)
    try {
      const updated = await profilesApi.update({
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        bio: bio.trim(),
        website: website.trim(),
        avatarUrl: avatarUrl.trim(),
      })
      setProfile(updated as UserProfile)
      onSuccess?.(updated as UserProfile)
      addToast('Perfil atualizado', 'success')
      navigate(`/profile/${(updated as UserProfile).username}`)
    } catch (error) {
      console.error('Failed to update profile', error)
      addToast('Falha ao atualizar perfil', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-darkSurface">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar url={avatarUrl} alt="Seu avatar" size="xl" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 rounded-full bg-azul p-2 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            aria-label="Alterar avatar"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        {isUploading && <span className="text-xs text-cinza">Enviando...</span>}
      </div>

      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Nome de exibição
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
        />
      </div>
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Nome de usuário
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
          required
          className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
        />
      </div>
      <div>
        <label htmlFor="bio" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Biografia
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
        />
      </div>
      <div>
        <label htmlFor="website" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Website
        </label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-cinza hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-gradient-to-r from-ciano to-azul px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </div>
    </form>
  )
}
