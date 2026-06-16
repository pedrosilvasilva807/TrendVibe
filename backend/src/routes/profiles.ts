import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import type { ApiResponse, ApiErrorResponse, UserProfile, Post } from '../types'

const router = Router()

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  displayName: z.string().max(80).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
})

router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('username', req.params.username).single()
    if (error) throw error
    res.status(200).json({ success: true, data: { profile: data as UserProfile } } as ApiResponse<{ profile: UserProfile }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to get profile by username', error)
    res.status(500).json({ success: false, error: 'Failed to get profile', details: error.message } as ApiErrorResponse)
  }
})

router.get('/id/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', req.params.id).single()
    if (error) throw error
    res.status(200).json({ success: true, data: { profile: data as UserProfile } } as ApiResponse<{ profile: UserProfile }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to get profile by id', error)
    res.status(500).json({ success: false, error: 'Failed to get profile', details: error.message } as ApiErrorResponse)
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response, next) => {
  const parse = updateProfileSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const userId = req.user!.id
    const userEmail = req.user!.email
    
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (parse.data.username !== undefined) updateData.username = parse.data.username
    if (parse.data.displayName !== undefined) updateData.display_name = parse.data.displayName || null
    if (parse.data.bio !== undefined) updateData.bio = parse.data.bio || null
    if (parse.data.avatarUrl !== undefined) updateData.avatar_url = parse.data.avatarUrl || null
    if (parse.data.website !== undefined) updateData.website = parse.data.website || null

    // First, ensure profile exists by upserting with minimal data if needed
    console.log('POST /profiles: ensuring profile exists for userId=', userId)
    const { error: ensureError } = await supabase
      .from('profiles')
      .upsert({ id: userId, email: userEmail }, { onConflict: 'id' })

    if (ensureError) {
      console.error('POST /profiles: ensure profile error=', ensureError)
      // Continue anyway, profile might already exist
    }

    // Now update with the provided data
    console.log('POST /profiles: updating profile with data=', updateData)
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('POST /profiles: update error=', error)
      return next(error)
    }
    
    console.log('POST /profiles: success, returned data=', data)
    res.status(200).json({ success: true, data: data as UserProfile } as ApiResponse<UserProfile>)
  } catch (err) {
    console.error('POST /profiles: exception=', err)
    next(err)
  }
})

router.post('/avatar', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { fileName } = req.body
    const path = `avatars/${req.user!.id}/${Date.now()}-${fileName}`
    const { data, error } = await supabase.storage.from('avatars').createSignedUploadUrl(path)
    if (error) throw error
    res.status(200).json({ success: true, data: { url: data.signedUrl, path } } as ApiResponse<{ url: string; path: string }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to create avatar upload url', error)
    res.status(500).json({ success: false, error: 'Failed to create upload URL', details: error.message } as ApiErrorResponse)
  }
})

router.post('/:id/follow', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error: insertError } = await supabase.from('follows').insert({ follower_id: req.user!.id, following_id: req.params.id })
    if (insertError) throw insertError
    res.status(200).json({ success: true, data: { isFollowing: true } } as ApiResponse<{ isFollowing: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to follow', error)
    res.status(500).json({ success: false, error: 'Failed to follow', details: error.message } as ApiErrorResponse)
  }
})

router.post('/:id/unfollow', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', req.user!.id)
      .eq('following_id', req.params.id)
    if (error) throw error
    res.status(200).json({ success: true, data: { isFollowing: false } } as ApiResponse<{ isFollowing: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to unfollow', error)
    res.status(500).json({ success: false, error: 'Failed to unfollow', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:id/is-following', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', req.user!.id)
      .eq('following_id', req.params.id)
      .maybeSingle()
    res.status(200).json({ success: true, data: { isFollowing: !!data } } as ApiResponse<{ isFollowing: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to check follow', error)
    res.status(500).json({ success: false, error: 'Failed to check follow', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:id/followers', async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = req.query
    const pageSize = Math.min(Number(limit || 20), 50)
    let query = supabase
      .from('follows')
      .select('follower_id, follower:profiles!follows_follower_id_fkey(*)')
      .eq('following_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1)
    if (cursor) {
      query = query.lt('created_at', cursor as string)
    }
    const { data, error } = await query
    if (error) throw error
    const users = ((data || []) as { follower: UserProfile }[]).map((item) => item.follower)
    const hasMore = users.length > pageSize
    const result = hasMore ? users.slice(0, pageSize) : users
    const nextCursor = hasMore ? data![pageSize].created_at : null
    res.status(200).json({
      success: true,
      data: { data: result, nextCursor, hasMore },
    } as ApiResponse<{ data: UserProfile[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list followers', error)
    res.status(500).json({ success: false, error: 'Failed to list followers', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:id/following', async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = req.query
    const pageSize = Math.min(Number(limit || 20), 50)
    let query = supabase
      .from('follows')
      .select('following_id, following:profiles!follows_following_id_fkey(*)')
      .eq('follower_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1)
    if (cursor) {
      query = query.lt('created_at', cursor as string)
    }
    const { data, error } = await query
    if (error) throw error
    const users = ((data || []) as { following: UserProfile }[]).map((item) => item.following)
    const hasMore = users.length > pageSize
    const result = hasMore ? users.slice(0, pageSize) : users
    const nextCursor = hasMore ? data![pageSize].created_at : null
    res.status(200).json({
      success: true,
      data: { data: result, nextCursor, hasMore },
    } as ApiResponse<{ data: UserProfile[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list following', error)
    res.status(500).json({ success: false, error: 'Failed to list following', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:id/posts', async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = req.query
    const pageSize = Math.min(Number(limit || 10), 50)
    let query = supabase
      .from('posts')
      .select('*, author:profiles!posts_user_id_fkey(*)')
      .eq('user_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1)
    if (cursor) {
      query = query.lt('created_at', cursor as string)
    }
    const { data, error } = await query
    if (error) throw error
    const items = (data || []) as Post[]
    const hasMore = items.length > pageSize
    const result = hasMore ? items.slice(0, pageSize) : items
    const nextCursor = hasMore ? data![pageSize].created_at : null
    res.status(200).json({
      success: true,
      data: { data: result, nextCursor, hasMore },
    } as ApiResponse<{ data: Post[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list profile posts', error)
    res.status(500).json({ success: false, error: 'Failed to list profile posts', details: error.message } as ApiErrorResponse)
  }
})

export default router
