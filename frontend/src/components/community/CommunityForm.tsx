import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { communitiesApi } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { CommunityFormProps } from '@/types/components'
import type { Community, CommunityCategory, CommunityStatus } from '@/types/database'

const categories: CommunityCategory[] = [
  'Desafio de Design',
  'Trend Musical',
  'Desafio Fotográfico',
  'Microficção',
  'Desafio de Código',
  'Trend de Humor',
  'Arte Digital',
  'Cosplay & Estilo',
  'Desafio Culinário',
  'Esportes & Aventura',
  'Outro',
]

export function CommunityForm({ initialData, onSuccess }: CommunityFormProps): JSX.Element {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [category, setCategory] = useState<CommunityCategory>(initialData?.category || 'Outro')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [status, setStatus] = useState<CommunityStatus>(initialData?.status || 'active')
  const [rules, setRules] = useState(initialData?.rules || '')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (title.trim().length === 0 || description.trim().length === 0) {
      addToast('Título e descrição são obrigatórios', 'error')
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl: imageUrl.trim() || undefined,
        status,
        rules: rules.trim() || undefined,
      }
      const result = initialData
        ? await communitiesApi.update(initialData.id, payload)
        : await communitiesApi.create(payload)
      addToast(initialData ? 'Comunidade atualizada' : 'Comunidade criada', 'success')
      onSuccess?.(result as Community)
      navigate(`/community/${(result as Community).id}`)
    } catch (error) {
      console.error('Failed to save community', error)
      addToast('Falha ao salvar comunidade', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-darkSurface">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
          placeholder="Nome da comunidade"
        />
      </div>
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Categoria
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as CommunityCategory)}
          className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
          placeholder="Descreva o propósito da comunidade"
        />
      </div>
      <div>
        <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          URL da imagem
        </label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
          placeholder="https://..."
        />
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as CommunityStatus)}
          className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
        >
          <option value="active">Ativa</option>
          <option value="archived">Arquivada</option>
          <option value="pending">Pendente</option>
        </select>
      </div>
      <div>
        <label htmlFor="rules" className="mb-1 block text-sm font-medium text-escuro dark:text-darkText">
          Regras breves
        </label>
        <textarea
          id="rules"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
          placeholder="Regras simples da comunidade"
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
          {isLoading ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Criar comunidade'}
        </button>
      </div>
    </form>
  )
}
