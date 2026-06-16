import type {
  CommunitiesResponse,
  CommentsResponse,
  ConversationsResponse,
  CreateCommentRequest,
  CreateCommunityRequest,
  CreatePostRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessagesResponse,
  PostsResponse,
  RegisterRequest,
  SendMessageRequest,
  UpdateCommentRequest,
  UpdateCommunityRequest,
  UpdatePostRequest,
  UpdateProfileRequest,
  UploadUrlResponse,
} from '@/types/api'
import type {
  Comment,
  Community,
  Conversation,
  Message,
  Post,
  UserProfile,
} from '@/types/database'
import { supabase } from './supabase'
import { getCurrentSession } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || '/api'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getCurrentSession().catch(() => null)
  const token = session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const body = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const errorMessage = typeof body === 'object' && body !== null && 'error' in body
      ? String((body as any).error)
      : typeof body === 'object' && body !== null && 'message' in body
      ? String((body as any).message)
      : `Request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  // Some backend routes wrap the payload as { success: true, data: T }
  // Unwrap that shape automatically so callers receive the inner data directly.
  if (typeof body === 'object' && body !== null && 'success' in body) {
    const b: any = body
    if (b.success === true && 'data' in b) {
      return b.data as T
    }
    if (b.success === false && 'error' in b) {
      throw new Error(String(b.error))
    }
  }

  return body as T
}

async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}${path}`, { method: 'GET', headers })
  return handleResponse<T>(response)
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers })
  return handleResponse<T>(response)
}

export const authApi = {
  login: (data: LoginRequest) => apiPost<{ user: UserProfile; token: string }>('/auth/login', data),
  register: (data: RegisterRequest) => apiPost<{ user: UserProfile; token: string }>('/auth/register', data),
  forgotPassword: (data: ForgotPasswordRequest) => apiPost<{ message: string }>('/auth/forgot-password', data),
  me: () => apiGet<{ user: UserProfile }>('/auth/me'),
}

export const postsApi = {
  list: (params: {
    sort?: 'recent' | 'trending'
    communityId?: string
    userId?: string
    cursor?: string
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params.sort) searchParams.set('sort', params.sort)
    if (params.communityId) searchParams.set('communityId', params.communityId)
    if (params.userId) searchParams.set('userId', params.userId)
    if (params.cursor) searchParams.set('cursor', params.cursor)
    if (params.limit) searchParams.set('limit', String(params.limit))
    return apiGet<PostsResponse>(`/posts?${searchParams.toString()}`)
  },
  create: (data: CreatePostRequest) => apiPost<Post>('/posts', data),
  update: (postId: string, data: UpdatePostRequest) => apiPatch<Post>(`/posts/${postId}`, data),
  delete: (postId: string) => apiDelete<void>(`/posts/${postId}`),
  like: (postId: string) => apiPost<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`, {}),
  getLikes: (postId: string, cursor?: string, limit?: number) => {
    const searchParams = new URLSearchParams()
    if (cursor) searchParams.set('cursor', cursor)
    if (limit) searchParams.set('limit', String(limit))
    return apiGet<{ data: UserProfile[]; nextCursor: string | null; hasMore: boolean }>(
      `/posts/${postId}/likes?${searchParams.toString()}`
    )
  },
}

export const commentsApi = {
  list: (postId: string, cursor?: string, limit?: number) => {
    const searchParams = new URLSearchParams()
    if (cursor) searchParams.set('cursor', cursor)
    if (limit) searchParams.set('limit', String(limit))
    return apiGet<CommentsResponse>(`/posts/${postId}/comments?${searchParams.toString()}`)
  },
  create: (data: CreateCommentRequest) => apiPost<Comment>('/comments', data),
  update: (commentId: string, data: UpdateCommentRequest) => apiPatch<Comment>(`/comments/${commentId}`, data),
  delete: (commentId: string) => apiDelete<void>(`/comments/${commentId}`),
}

export const communitiesApi = {
  list: (params: { search?: string; category?: string; cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set('search', params.search)
    if (params.category) searchParams.set('category', params.category)
    if (params.cursor) searchParams.set('cursor', params.cursor)
    if (params.limit) searchParams.set('limit', String(params.limit))
    return apiGet<CommunitiesResponse>(`/communities?${searchParams.toString()}`)
  },
  my: () => apiGet<CommunitiesResponse>('/communities/my'),
  getById: (id: string) => apiGet<{ community: Community }>(`/communities/${id}`),
  create: (data: CreateCommunityRequest) => apiPost<Community>('/communities', data),
  update: (id: string, data: UpdateCommunityRequest) => apiPatch<Community>(`/communities/${id}`, data),
  delete: (id: string) => apiDelete<void>(`/communities/${id}`),
  join: (id: string) => apiPost<{ isMember: boolean }>(`/communities/${id}/join`, {}),
  leave: (id: string) => apiPost<{ isMember: boolean }>(`/communities/${id}/leave`, {}),
  getPosts: (id: string, cursor?: string, limit?: number) => {
    const searchParams = new URLSearchParams()
    if (cursor) searchParams.set('cursor', cursor)
    if (limit) searchParams.set('limit', String(limit))
    return apiGet<PostsResponse>(`/communities/${id}/posts?${searchParams.toString()}`)
  },
}

export const profilesApi = {
  getByUsername: (username: string) => apiGet<{ profile: UserProfile }>(`/profiles/${username}`),
  getById: (id: string) => apiGet<{ profile: UserProfile }>(`/profiles/${id}`),
  update: (data: UpdateProfileRequest) => apiPost<UserProfile>('/profiles', data),
  uploadAvatar: (file: File) => apiPost<UploadUrlResponse>('/profiles/avatar', { fileName: file.name }),
  follow: (userId: string) => apiPost<{ isFollowing: boolean }>(`/profiles/${userId}/follow`, {}),
  unfollow: (userId: string) => apiPost<{ isFollowing: boolean }>(`/profiles/${userId}/unfollow`, {}),
  isFollowing: (userId: string) => apiGet<{ isFollowing: boolean }>(`/profiles/${userId}/is-following`),
  followers: (userId: string, cursor?: string, limit?: number) => {
    const searchParams = new URLSearchParams()
    if (cursor) searchParams.set('cursor', cursor)
    if (limit) searchParams.set('limit', String(limit))
    return apiGet<{ data: UserProfile[]; nextCursor: string | null; hasMore: boolean }>(
      `/profiles/${userId}/followers?${searchParams.toString()}`
    )
  },
  following: (userId: string, cursor?: string, limit?: number) => {
    const searchParams = new URLSearchParams()
    if (cursor) searchParams.set('cursor', cursor)
    if (limit) searchParams.set('limit', String(limit))
    return apiGet<{ data: UserProfile[]; nextCursor: string | null; hasMore: boolean }>(
      `/profiles/${userId}/following?${searchParams.toString()}`
    )
  },
  posts: (userId: string, cursor?: string, limit?: number) => {
    const searchParams = new URLSearchParams()
    if (cursor) searchParams.set('cursor', cursor)
    if (limit) searchParams.set('limit', String(limit))
    return apiGet<PostsResponse>(`/profiles/${userId}/posts?${searchParams.toString()}`)
  },
}

export const chatApi = {
  listConversations: () => apiGet<ConversationsResponse>('/conversations'),
  getOrCreate: (recipientId: string) => apiPost<{ conversation: Conversation }>(`/conversations/${recipientId}`, {}),
  listMessages: (conversationId: string, cursor?: string, limit?: number) => {
    const searchParams = new URLSearchParams()
    if (cursor) searchParams.set('cursor', cursor)
    if (limit) searchParams.set('limit', String(limit))
    return apiGet<MessagesResponse>(`/conversations/${conversationId}/messages?${searchParams.toString()}`)
  },
  sendMessage: (data: SendMessageRequest) => apiPost<Message>('/messages', data),
  markAsRead: (conversationId: string) => apiPost<void>(`/conversations/${conversationId}/read`, {}),
  getPublicKey: (userId: string) => apiGet<{ publicKey: JsonWebKey }>(`/keys/${userId}`),
  savePublicKey: (publicKey: JsonWebKey) => apiPost<void>('/keys', { publicKey }),
}

export const uploadFile = async (bucket: string, path: string, file: File): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) {
    throw error
  }
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrlData.publicUrl
}
