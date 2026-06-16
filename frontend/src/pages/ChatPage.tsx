import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useChatStore } from '@/stores/useChatStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { chatApi } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { Conversation } from '@/types/database'

export function ChatPage(): JSX.Element {
  const { conversationId, userId } = useParams<{ conversationId?: string; userId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const { conversations, selectedConversation, setConversations, setSelectedConversation, addConversation, reset } = useChatStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadConversations() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await chatApi.listConversations()
      setConversations(response.data)
    } catch (err) {
      console.error('Failed to load conversations', err)
      setError('Não foi possível carregar as conversas.')
      addToast('Falha ao carregar conversas', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function initializeNewChat(recipientId: string) {
    try {
      const response = await chatApi.getOrCreate(recipientId)
      addConversation(response.conversation)
      setSelectedConversation(response.conversation)
      navigate(`/chat/${response.conversation.id}`, { replace: true })
    } catch (err) {
      console.error('Failed to initialize conversation', err)
      addToast('Não foi possível iniciar a conversa', 'error')
    }
  }

  useEffect(() => {
    reset()
    loadConversations()
  }, [])

  useEffect(() => {
    if (userId) {
      initializeNewChat(userId)
    } else if (conversationId) {
      const found = conversations.find((c) => c.id === conversationId)
      if (found) {
        setSelectedConversation(found)
      }
    } else {
      setSelectedConversation(null)
    }
  }, [conversationId, userId, conversations])

  function handleSelect(conversation: Conversation) {
    setSelectedConversation(conversation)
    navigate(`/chat/${conversation.id}`)
  }

  if (!user) {
    return <ErrorMessage title="Autenticação necessária" message="Faça login para acessar as mensagens." />
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-darkSurface lg:flex-row">
      <div className="h-1/2 lg:h-full lg:w-80">
        {isLoading ? <Skeleton className="h-full w-full" /> : <ChatList conversations={conversations} selectedId={selectedConversation?.id || null} onSelect={handleSelect} />}
      </div>
      <div className="h-1/2 flex-1 border-t border-slate-200 lg:h-full lg:border-l lg:border-t-0 dark:border-slate-800">
        {error ? (
          <ErrorMessage message={error} onRetry={loadConversations} />
        ) : selectedConversation ? (
          <ChatWindow conversation={selectedConversation} currentUserId={user.id} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-cinza">Selecione uma conversa</div>
        )}
      </div>
    </div>
  )
}
