import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import type { ApiResponse, ApiErrorResponse, Comment } from '../types'

const router = Router()

const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().max(500),
})

const updateCommentSchema = z.object({
  content: z.string().max(500),
})

router.get('/:postId', async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = req.query
    const pageSize = Math.min(Number(limit || 20), 50)
    let query = supabase
      .from('comments')
      .select('*, author:profiles(*)')
      .eq('post_id', req.params.postId)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1)
    if (cursor) {
      query = query.lt('created_at', cursor as string)
    }
    const { data, error } = await query
    if (error) throw error
    const items = (data || []) as Comment[]
    const hasMore = items.length > pageSize
    const result = hasMore ? items.slice(0, pageSize) : items
    const nextCursor = hasMore ? data![pageSize].created_at : null
    res.status(200).json({
      success: true,
      data: { data: result, nextCursor, hasMore },
    } as ApiResponse<{ data: Comment[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list comments', error)
    res.status(500).json({ success: false, error: 'Failed to list comments', details: error.message } as ApiErrorResponse)
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parse = createCommentSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: parse.data.postId, user_id: req.user!.id, content: parse.data.content })
      .select('*, author:profiles(*)')
      .single()
    if (error) throw error
    res.status(201).json({ success: true, data: data as Comment } as ApiResponse<Comment>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to create comment', error)
    res.status(500).json({ success: false, error: 'Failed to create comment', details: error.message } as ApiErrorResponse)
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  const parse = updateCommentSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const { data: existing, error: fetchError } = await supabase.from('comments').select('user_id').eq('id', req.params.id).single()
    if (fetchError) throw fetchError
    if (existing.user_id !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiErrorResponse)
      return
    }
    const { data, error } = await supabase
      .from('comments')
      .update({ content: parse.data.content })
      .eq('id', req.params.id)
      .select('*, author:profiles(*)')
      .single()
    if (error) throw error
    res.status(200).json({ success: true, data: data as Comment } as ApiResponse<Comment>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to update comment', error)
    res.status(500).json({ success: false, error: 'Failed to update comment', details: error.message } as ApiErrorResponse)
  }
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data: existing, error: fetchError } = await supabase.from('comments').select('user_id').eq('id', req.params.id).single()
    if (fetchError) throw fetchError
    if (existing.user_id !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiErrorResponse)
      return
    }
    const { error } = await supabase.from('comments').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).send()
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to delete comment', error)
    res.status(500).json({ success: false, error: 'Failed to delete comment', details: error.message } as ApiErrorResponse)
  }
})

export default router
