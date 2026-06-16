import type {
  Comment,
  Community,
  CommunityCategory,
  CommunityStatus,
  Conversation,
  Message,
  Notification,
  Post,
  UserProfile,
} from './database'

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: string }

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  password: string
}

export interface CreatePostRequest {
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | null
  communityId?: string
}

export interface UpdatePostRequest {
  content?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | null
}

export interface CreateCommentRequest {
  postId: string
  content: string
}

export interface UpdateCommentRequest {
  content: string
}

export interface CreateCommunityRequest {
  title: string
  description: string
  category: CommunityCategory
  imageUrl?: string
  status: CommunityStatus
  rules?: string
}

export interface UpdateCommunityRequest {
  title?: string
  description?: string
  category?: CommunityCategory
  imageUrl?: string
  status?: CommunityStatus
  rules?: string
}

export interface UpdateProfileRequest {
  username?: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  website?: string
}

export interface SendMessageRequest {
  recipientId: string
  encryptedContent: string
  iv: string
}

export interface ListPostsQuery {
  sort?: 'recent' | 'trending'
  communityId?: string
  userId?: string
  cursor?: string
  limit?: number
}

export interface ListCommunitiesQuery {
  search?: string
  category?: string
  cursor?: string
  limit?: number
}

export interface ListMessagesQuery {
  conversationId: string
  cursor?: string
  limit?: number
}

export interface PostsResponse {
  data: Post[]
  nextCursor: string | null
  hasMore: boolean
}

export interface CommunitiesResponse {
  data: Community[]
  nextCursor: string | null
  hasMore: boolean
}

export interface CommentsResponse {
  data: Comment[]
  nextCursor: string | null
  hasMore: boolean
}

export interface ConversationsResponse {
  data: Conversation[]
  nextCursor: string | null
  hasMore: boolean
}

export interface MessagesResponse {
  data: Message[]
  nextCursor: string | null
  hasMore: boolean
}

export interface NotificationsResponse {
  data: Notification[]
  nextCursor: string | null
  hasMore: boolean
}

export interface PublicKeyResponse {
  publicKey: JsonWebKey
}

export interface UploadUrlResponse {
  url: string
  path: string
}

export interface FollowersResponse {
  data: UserProfile[]
  nextCursor: string | null
  hasMore: boolean
}

export interface LikesResponse {
  data: UserProfile[]
  nextCursor: string | null
  hasMore: boolean
}
