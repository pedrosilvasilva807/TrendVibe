import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { decryptMessage } from '@/lib/crypto'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatRelativeTime } from '@/utils/format'
import type { MessageBubbleProps } from '@/types/components'

export function MessageBubble({ message, isOwn, otherParticipantName }: MessageBubbleProps): JSX.Element {
  const { user } = useAuthStore()
  const [plainText, setPlainText] = useState('Decifrando...')

  useEffect(() => {
    let isMounted = true
    async function decrypt() {
      if (!user) return
      try {
        const text = await decryptMessage(message.encrypted_content, message.iv, user.id)
        if (isMounted) setPlainText(text)
      } catch (error) {
        console.error('Failed to decrypt message', error)
        if (isMounted) setPlainText('🔒 Não foi possível decifrar')
      }
    }
    decrypt()
    return () => {
      isMounted = false
    }
  }, [message, user])

  const participantName = isOwn ? 'Você' : otherParticipantName

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar url={message.sender?.avatar_url} alt={participantName} size="sm" />
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isOwn
            ? 'rounded-br-none bg-gradient-to-r from-ciano to-azul text-white'
            : 'rounded-bl-none bg-surface text-escuro dark:bg-escuro dark:text-darkText'
        }`}
      >
        <p>{plainText}</p>
        <span className={`mt-1 block text-[10px] ${isOwn ? 'text-white/70' : 'text-cinza'}`}>
          {formatRelativeTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}
