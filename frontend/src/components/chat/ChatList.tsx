import { useState } from 'react'
import { Search } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useDebounce } from '@/hooks/useDebounce'
import { formatRelativeTime } from '@/utils/format'
import type { ChatListProps } from '@/types/components'

export function ChatList({ conversations, selectedId, onSelect }: ChatListProps): JSX.Element {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const filtered = conversations.filter((conversation) => {
    const name = conversation.other_participant?.display_name || ''
    const username = conversation.other_participant?.username || ''
    const query = debouncedSearch.toLowerCase()
    return name.toLowerCase().includes(query) || username.toLowerCase().includes(query)
  })

  return (
    <div className="flex h-full flex-col border-r border-slate-200 dark:border-slate-800">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cinza" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa"
            className="w-full rounded-xl border border-slate-200 bg-surface py-2 pl-9 pr-3 text-sm text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-cinza">Nenhuma conversa</div>
        ) : (
          <div className="space-y-1 p-2">
            {filtered.map((conversation) => {
              const other = conversation.other_participant
              const isSelected = selectedId === conversation.id
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-r from-ciano/10 to-azul/10'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Avatar url={other?.avatar_url} alt={other?.display_name || 'Usuário'} size="md" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium text-escuro dark:text-darkText">
                        {other?.display_name || 'Usuário'}
                      </span>
                      {conversation.last_message && (
                        <span className="text-[10px] text-cinza">
                          {formatRelativeTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-cinza">
                      {conversation.last_message ? '🔒 Mensagem cifrada' : 'Nenhuma mensagem'}
                    </p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-azul px-1.5 text-[10px] font-bold text-white">
                      {conversation.unread_count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
