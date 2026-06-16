import { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { CommunityList } from '@/components/community/CommunityList'
import { useCommunityStore } from '@/stores/useCommunityStore'
import { communitiesApi } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'


const categories = [
  'Todas',
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
]

export function ExplorePage(): JSX.Element {
  const { communities, isLoading, hasMore, setCommunities, appendCommunities, setLoading, setLoadingMore, setHasMore, reset } = useCommunityStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const debouncedSearch = useDebounce(search, 400)

  const loadCommunities = useCallback(
    async (cursor?: string) => {
      if (!cursor) setLoading(true)
      else setLoadingMore(true)
      try {
        const response = await communitiesApi.list({
          search: debouncedSearch,
          category: category === 'Todas' ? undefined : category,
          cursor,
          limit: 10,
        })
        if (cursor) {
          appendCommunities(response.data)
        } else {
          setCommunities(response.data)
        }
        setHasMore(response.hasMore)
      } catch (err) {
        console.error('Failed to load communities', err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [debouncedSearch, category, setCommunities, appendCommunities, setHasMore, setLoading, setLoadingMore]
  )

  useEffect(() => {
    reset()
    loadCommunities()
  }, [debouncedSearch, category])

  function handleLoadMore() {
    const last = communities[communities.length - 1]
    if (last && hasMore) {
      loadCommunities(last.created_at)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-escuro dark:text-darkText">Explorar comunidades</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cinza" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar comunidades..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-darkSurface dark:text-darkText"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === cat
                ? 'bg-azul text-white'
                : 'border border-slate-200 bg-white text-cinza hover:bg-slate-50 dark:border-slate-800 dark:bg-darkSurface dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <CommunityList
        communities={communities}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyMessage="Nenhuma comunidade encontrada"
      />
    </div>
  )
}
