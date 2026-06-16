import { create } from 'zustand'
import type { Conversation, Message } from '@/types/database'

interface ChatState {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isLoadingMessages: boolean
  error: string | null
  hasMore: boolean
  cursor: string | null
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (conversation: Conversation) => void
  setSelectedConversation: (conversation: Conversation | null) => void
  setMessages: (messages: Message[]) => void
  prependMessages: (messages: Message[]) => void
  appendMessage: (message: Message) => void
  markMessagesRead: (conversationId: string) => void
  setLoading: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  setError: (error: string | null) => void
  setHasMore: (hasMore: boolean) => void
  setCursor: (cursor: string | null) => void
  reset: () => void
}

const initialState = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  error: null,
  hasMore: true,
  cursor: null,
}

export const useChatStore = create<ChatState>()((set) => ({
  ...initialState,
  setConversations: (conversations: Conversation[]) => set({ conversations }),
  addConversation: (conversation: Conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  updateConversation: (conversation: Conversation) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === conversation.id ? conversation : c)),
    })),
  setSelectedConversation: (selectedConversation: Conversation | null) => set({ selectedConversation, messages: [] }),
  setMessages: (messages: Message[]) => set({ messages }),
  prependMessages: (messages: Message[]) =>
    set((state) => ({
      messages: [...messages, ...state.messages],
    })),
  appendMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  markMessagesRead: (conversationId: string) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ),
    })),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setLoadingMessages: (isLoadingMessages: boolean) => set({ isLoadingMessages }),
  setError: (error: string | null) => set({ error }),
  setHasMore: (hasMore: boolean) => set({ hasMore }),
  setCursor: (cursor: string | null) => set({ cursor }),
  reset: () => set(initialState),
}))
