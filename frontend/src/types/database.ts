export type DatabaseUuid = string

export interface UserProfile {
  id: DatabaseUuid
  email: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  created_at: string
  updated_at: string
  followers_count: number
  following_count: number
  posts_count: number
  communities_count: number
}

export interface Follow {
  id: DatabaseUuid
  follower_id: DatabaseUuid
  following_id: DatabaseUuid
  created_at: string
}

export type CommunityCategory =
  | 'Desafio de Design'
  | 'Trend Musical'
  | 'Desafio Fotográfico'
  | 'Microficção'
  | 'Desafio de Código'
  | 'Trend de Humor'
  | 'Arte Digital'
  | 'Cosplay & Estilo'
  | 'Desafio Culinário'
  | 'Esportes & Aventura'
  | 'Outro'

export type CommunityStatus = 'active' | 'archived' | 'pending'

export interface Community {
  id: DatabaseUuid
  title: string
  description: string
  category: CommunityCategory
  image_url: string | null
  status: CommunityStatus
  rules: string | null
  created_by: DatabaseUuid
  created_at: string
  updated_at: string
  members_count: number
  posts_count: number
  creator?: UserProfile
  is_member?: boolean
}

export interface CommunityMember {
  id: DatabaseUuid
  community_id: DatabaseUuid
  user_id: DatabaseUuid
  role: 'member' | 'moderator' | 'creator'
  joined_at: string
}

export interface Post {
  id: DatabaseUuid
  user_id: DatabaseUuid
  content: string
  media_url: string | null
  media_type: 'image' | 'video' | null
  community_id: DatabaseUuid | null
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
  author?: UserProfile
  community?: Community
  has_liked?: boolean
}

export interface Like {
  id: DatabaseUuid
  post_id: DatabaseUuid
  user_id: DatabaseUuid
  created_at: string
  user?: UserProfile
}

export interface Comment {
  id: DatabaseUuid
  post_id: DatabaseUuid
  user_id: DatabaseUuid
  content: string
  created_at: string
  updated_at: string
  author?: UserProfile
}

export interface Message {
  id: DatabaseUuid
  conversation_id: DatabaseUuid
  sender_id: DatabaseUuid
  encrypted_content: string
  iv: string
  created_at: string
  is_read: boolean
  sender?: UserProfile
}

export interface Conversation {
  id: DatabaseUuid
  participant_a: DatabaseUuid
  participant_b: DatabaseUuid
  created_at: string
  updated_at: string
  other_participant?: UserProfile
  last_message?: Message
  unread_count: number
}

export interface Notification {
  id: DatabaseUuid
  user_id: DatabaseUuid
  type: 'like' | 'comment' | 'follow' | 'message' | 'community_invite'
  actor_id: DatabaseUuid | null
  target_id: DatabaseUuid | null
  target_type: string | null
  is_read: boolean
  created_at: string
  actor?: UserProfile
}

export type Tables =
  | 'profiles'
  | 'follows'
  | 'communities'
  | 'community_members'
  | 'posts'
  | 'likes'
  | 'comments'
  | 'messages'
  | 'conversations'
  | 'notifications'
