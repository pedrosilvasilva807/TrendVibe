import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import type { ApiResponse, ApiErrorResponse, Post, UserProfile } from '../types'

const router = Router()

const createPostSchema = z.object({
  content: z.string().max(500),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'video']).nullable().optional(),
  communityId: z.string().uuid().optional(),
})

const updatePostSchema = z.object({
  content: z.string().max(500).optional(),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  mediaType: z.enum(['image', 'video']).nullable().optional(),
})

function enrichPost(queryBuilder: ReturnType<typeof supabase.from>) {
  return queryBuilder
    .select('*, author:profiles!posts_user_id_fkey(*), community:communities(*)')
}

function buildListQuery(
  req: Request,
  res: Response,
  baseQuery: ReturnType<typeof supabase.from>
) {
  const { sort, communityId, userId, cursor, limit } = req.query
  let query = enrichPost(baseQuery)

  if (communityId) {
    query = query.eq('community_id', communityId as string)
  }
  if (userId) {
    query = query.eq('user_id', userId as string)
  }

  if (sort === 'trending') {
    query = query.order('likes_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (cursor) {
    const cursorColumn = sort === 'trending' ? 'likes_count' : 'created_at'
    if (cursorColumn === 'likes_count') {
      const likesCount = Number(cursor)
      query = query.lt(cursorColumn, likesCount)
    } else {
      query = query.lt(cursorColumn, cursor as string)
    }
  }

  const pageSize = Math.min(Number(limit || 10), 50)
  query = query.limit(pageSize + 1)
  return { query, pageSize }
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { query, pageSize } = buildListQuery(req, res, supabase.from('posts'))
    const { data, error } = await query
    if (error) throw error
    const items = (data || []) as Post[]
    const hasMore = items.length > pageSize
    const result = hasMore ? items.slice(0, pageSize) : items
    const nextCursor = hasMore ? result[result.length - 1]?.created_at || null : null
    res.status(200).json({
      success: true,
      data: { data: result, nextCursor, hasMore },
    } as ApiResponse<{ data: Post[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list posts', error)
    res.status(500).json({ success: false, error: 'Failed to list posts', details: error.message } as ApiErrorResponse)
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parse = createPostSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: req.user!.id,
        content: parse.data.content,
        media_url: parse.data.mediaUrl || null,
        media_type: parse.data.mediaType || null,
        community_id: parse.data.communityId || null,
      })
      .select('*, author:profiles!posts_user_id_fkey(*), community:communities(*)')
      .single()
    if (error) throw error
    res.status(201).json({ success: true, data: data as Post } as ApiResponse<Post>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to create post', error)
    res.status(500).json({ success: false, error: 'Failed to create post', details: error.message } as ApiErrorResponse)
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  const parse = updatePostSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const { data: existing, error: fetchError } = await supabase.from('posts').select('user_id').eq('id', req.params.id).single()
    if (fetchError) throw fetchError
    if (existing.user_id !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiErrorResponse)
      return
    }
    const updateData: Record<string, unknown> = {}
    if (parse.data.content !== undefined) updateData.content = parse.data.content
    if (parse.data.mediaUrl !== undefined) updateData.media_url = parse.data.mediaUrl || null
    if (parse.data.mediaType !== undefined) updateData.media_type = parse.data.mediaType

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', req.params.id)
      .select('*, author:profiles!posts_user_id_fkey(*), community:communities(*)')
      .single()
    if (error) throw error
    res.status(200).json({ success: true, data: data as Post } as ApiResponse<Post>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to update post', error)
    res.status(500).json({ success: false, error: 'Failed to update post', details: error.message } as ApiErrorResponse)
  }
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data: existing, error: fetchError } = await supabase.from('posts').select('user_id').eq('id', req.params.id).single()
    if (fetchError) throw fetchError
    if (existing.user_id !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiErrorResponse)
      return
    }
    const { error } = await supabase.from('posts').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).send()
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to delete post', error)
    res.status(500).json({ success: false, error: 'Failed to delete post', details: error.message } as ApiErrorResponse)
  }
})

router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', req.params.id)
      .eq('user_id', req.user!.id)
      .maybeSingle()
    if (fetchError) throw fetchError

    if (existing) {
      const { error: deleteError } = await supabase.from('likes').delete().eq('id', existing.id)
      if (deleteError) throw deleteError
    } else {
      const { error: insertError } = await supabase.from('likes').insert({ post_id: req.params.id, user_id: req.user!.id })
      if (insertError) throw insertError
    }

    const { data: post, error: postError } = await supabase.from('posts').select('likes_count').eq('id', req.params.id).single()
    if (postError) throw postError

    res.status(200).json({
      success: true,
      data: { liked: !existing, likesCount: post.likes_count || 0 },
    } as ApiResponse<{ liked: boolean; likesCount: number }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to toggle like', error)
    res.status(500).json({ success: false, error: 'Failed to toggle like', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:id/likes', async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = req.query
    const pageSize = Math.min(Number(limit || 20), 50)
    let query = supabase
      .from('likes')
      .select('user_id, user:profiles(*)')
      .eq('post_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1)
    if (cursor) {
      query = query.lt('created_at', cursor as string)
    }
    const { data, error } = await query
    if (error) throw error
    const users = ((data || []) as { user: UserProfile }[]).map((item) => item.user)
    const hasMore = users.length > pageSize
    const result = hasMore ? users.slice(0, pageSize) : users
    const nextCursor = hasMore ? data![pageSize].created_at : null
    res.status(200).json({
      success: true,
      data: { data: result, nextCursor, hasMore },
    } as ApiResponse<{ data: UserProfile[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list likes', error)
    res.status(500).json({ success: false, error: 'Failed to list likes', details: error.message } as ApiErrorResponse)
  }
})

export default router
