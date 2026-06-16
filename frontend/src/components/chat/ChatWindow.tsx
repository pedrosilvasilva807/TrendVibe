import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { chatApi } from '@/lib/api'
import { useChatStore } from '@/stores/useChatStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { encryptMessage } from '@/lib/crypto'
import { MessageBubble } from './MessageBubble'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useToast } from '@/components/ui/Toast'
import type { ChatWindowProps } from '@/types/components'
import type { Message } from '@/types/database'

export function ChatWindow({ conversation, currentUserId }: ChatWindowProps): JSX.Element {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const { messages, setMessages, appendMessage, setLoadingMessages, markMessagesRead } = useChatStore()
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const other = conversation.other_participant

  async function loadMessages() {
    setIsLoading(true)
    setLoadingMessages(true)
    setError(null)
    try {
      const response = await chatApi.listMessages(conversation.id, undefined, 50)
      setMessages(response.data)
      await chatApi.markAsRead(conversation.id)
      markMessagesRead(conversation.id)
    } catch (err) {
      console.error('Failed to load messages', err)
      setError('Não foi possível carregar as mensagens.')
    } finally {
      setIsLoading(false)
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [conversation.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = newMessage.trim()
    if (trimmed.length === 0 || !other || !user) return

    setIsSending(true)
    try {
      const response = await chatApi.getPublicKey(other.id)
      const publicKey = await window.crypto.subtle.importKey(
        'jwk',
        response.publicKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
      )
      const encrypted = await encryptMessage(trimmed, publicKey)
      const sent = await chatApi.sendMessage({
        recipientId: other.id,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
      })
      appendMessage(sent as Message)
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message', err)
      addToast('Não foi possível enviar a mensagem', 'error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
        <Avatar url={other?.avatar_url} alt={other?.display_name || 'Usuário'} size="md" />
        <div>
          <p className="font-semibold text-escuro dark:text-darkText">{other?.display_name || 'Usuário'}</p>
          <p className="text-xs text-cinza">@{other?.username || 'handle'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {isLoading && <Skeleton className="h-20 w-full" />}
        {!isLoading && error && <ErrorMessage message={error} onRetry={loadMessages} />}
        {!isLoading && !error && messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-cinza">Nenhuma mensagem ainda</div>
        )}
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
              otherParticipantName={other?.display_name || 'Usuário'}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-full border border-slate-200 bg-surface px-4 py-2.5 text-sm text-escuro focus:border-azul focus:outline-none dark:border-slate-800 dark:bg-escuro dark:text-darkText"
          />
          <button
            type="submit"
            disabled={isSending || newMessage.trim().length === 0}
            className="rounded-full bg-gradient-to-r from-ciano to-azul p-2.5 text-white disabled:opacity-50"
            aria-label="Enviar mensagem"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
