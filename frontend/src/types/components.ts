import type { ReactNode } from 'react'
import type {
  Community,
  Conversation,
  Message,
  Post,
  UserProfile,
} from './database'

export interface ChildrenProps {
  children: ReactNode
}

export interface SkeletonProps {
  className?: string
}

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type'], duration?: number) => void
  removeToast: (id: string) => void
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export interface AvatarProps {
  url: string | null | undefined
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface FeedPostProps {
  post: Post
  onDelete?: (postId: string) => void
}

export interface PostActionsProps {
  post: Post
  onCommentClick?: () => void
}

export interface PostFormProps {
  communityId?: string
  onSuccess?: () => void
}

export interface CommentSectionProps {
  postId: string
}

export interface CommunityCardProps {
  community: Community
  onJoinToggle?: (community: Community) => void
}

export interface CommunityListProps {
  communities: Community[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  emptyMessage?: string
}

export interface CommunityFormProps {
  initialData?: Community
  onSuccess?: (community: Community) => void
}

export interface CommunityDetailProps {
  community: Community
  isMember: boolean
  onJoinToggle: () => Promise<void>
}

export interface ProfileHeaderProps {
  profile: UserProfile
  isOwnProfile: boolean
  isFollowing: boolean
  onFollowToggle: () => Promise<void>
}

export interface ProfileEditFormProps {
  profile: UserProfile
  onSuccess?: (profile: UserProfile) => void
}

export interface FollowButtonProps {
  isFollowing: boolean
  onToggle: () => Promise<void>
  isLoading?: boolean
}

export interface ChatListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (conversation: Conversation) => void
}

export interface ChatWindowProps {
  conversation: Conversation
  currentUserId: string
}

export interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  otherParticipantName: string
}

export interface ThemeToggleProps {
  className?: string
}

export interface RouteGuardProps {
  children: ReactNode
  requireAuth?: boolean
}

export type FeedSort = 'recent' | 'trending'

export interface FeedFilters {
  sort: FeedSort
  communityId?: string
  userId?: string
}

export interface ApiErrorResponse {
  error: string
  details?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface PublicKeyPayload {
  userId: string
  publicKey: JsonWebKey
}

export interface EncryptedMessagePayload {
  encryptedContent: string
  iv: string
}

export type JsonWebKey = CryptoKey
