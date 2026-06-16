import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useFeedStore } from '@/stores/useFeedStore'
import { useChatStore } from '@/stores/useChatStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Post, Message } from '@/types/database'

export function useRealtime() {
  const { user } = useAuthStore()
  const { prependPost, updatePost, removePost } = useFeedStore()
  const { appendMessage, selectedConversation, updateConversation } = useChatStore()

  useEffect(() => {
    const postsChannel = supabase
      .channel('public-posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload: RealtimePostgresChangesPayload<Post>) => {
          if (payload.eventType === 'INSERT') {
            prependPost(payload.new as Post)
          } else if (payload.eventType === 'UPDATE') {
            updatePost(payload.new as Post)
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Post
            removePost(deleted.id)
          }
        }
      )
      .subscribe()

    return () => {
      postsChannel.unsubscribe()
    }
  }, [prependPost, updatePost, removePost])

  useEffect(() => {
    if (!user || !selectedConversation) {
      return
    }
    const conversationId = selectedConversation.id
    const messagesChannel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const message = payload.new as Message
          if (message.sender_id !== user.id) {
            appendMessage(message)
            updateConversation({
              ...selectedConversation,
              last_message: message,
            })
          }
        }
      )
      .subscribe()

    return () => {
      messagesChannel.unsubscribe()
    }
  }, [user, selectedConversation, appendMessage, updateConversation])
}
