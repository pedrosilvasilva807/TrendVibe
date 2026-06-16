import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import type { ApiResponse, ApiErrorResponse, Community, CommunityCategory, CommunityStatus, Post } from '../types'

const router = Router()

const categorySchema = z.enum([
  'Desafio de Design',
  'Trend Musical',
  'Desafio Fotográfico',
  'Microficção',
  'Desafio de Código',
  'Trend de Humor',
  'Arte Digital',
  'Cosplay & Estilo',
  'Desafio Culinário',
  'Esportes & Aventura',
  'Outro',
])

const statusSchema = z.enum(['active', 'archived', 'pending'])

const createCommunitySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  category: categorySchema,
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: statusSchema,
  rules: z.string().max(2000).optional().or(z.literal('')),
})

const updateCommunitySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: categorySchema.optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: statusSchema.optional(),
  rules: z.string().max(2000).optional().or(z.literal('')),
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, cursor, limit } = req.query
    const pageSize = Math.min(Number(limit || 10), 50)
    let query = supabase.from('communities').select('*').order('created_at', { ascending: false })
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (category) {
      query = query.eq('category', category as CommunityCategory)
    }
    if (cursor) {
      query = query.lt('created_at', cursor as string)
    }
    query = query.limit(pageSize + 1)
    const { data, error } = await query
    if (error) throw error
    const items = (data || []) as Community[]
    const hasMore = items.length > pageSize
    const result = hasMore ? items.slice(0, pageSize) : items
    const nextCursor = hasMore ? data![pageSize].created_at : null
    res.status(200).json({
      success: true,
      data: { data: result, nextCursor, hasMore },
    } as ApiResponse<{ data: Community[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list communities', error)
    res.status(500).json({ success: false, error: 'Failed to list communities', details: error.message } as ApiErrorResponse)
  }
})

router.get('/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .select('community:communities(*)')
      .eq('user_id', req.user!.id)
      .order('joined_at', { ascending: false })
    if (error) throw error
    const communities = ((data || []) as { community: Community }[]).map((item) => item.community)
    res.status(200).json({
      success: true,
      data: { data: communities, nextCursor: null, hasMore: false },
    } as ApiResponse<{ data: Community[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list my communities', error)
    res.status(500).json({ success: false, error: 'Failed to list my communities', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('communities').select('*').eq('id', req.params.id).single()
    if (error) throw error
    const community = data as Community
    let isMember = false
    if (req.user) {
      const { data: member } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', req.params.id)
        .eq('user_id', req.user.id)
        .maybeSingle()
      isMember = !!member
    }
    res.status(200).json({ success: true, data: { community: { ...community, is_member: isMember } } } as ApiResponse<{ community: Community & { is_member: boolean } }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to get community', error)
    res.status(500).json({ success: false, error: 'Failed to get community', details: error.message } as ApiErrorResponse)
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parse = createCommunitySchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const { data, error } = await supabase
      .from('communities')
      .insert({
        title: parse.data.title,
        description: parse.data.description,
        category: parse.data.category,
        image_url: parse.data.imageUrl || null,
        status: parse.data.status,
        rules: parse.data.rules || null,
        created_by: req.user!.id,
      })
      .select('*')
      .single()
    if (error) throw error
    await supabase.from('community_members').insert({
      community_id: (data as Community).id,
      user_id: req.user!.id,
      role: 'creator',
    })
    res.status(201).json({ success: true, data: data as Community } as ApiResponse<Community>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to create community', error)
    res.status(500).json({ success: false, error: 'Failed to create community', details: error.message } as ApiErrorResponse)
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  const parse = updateCommunitySchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const { data: existing, error: fetchError } = await supabase.from('communities').select('created_by').eq('id', req.params.id).single()
    if (fetchError) throw fetchError
    if (existing.created_by !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiErrorResponse)
      return
    }
    const updateData: Record<string, unknown> = {}
    if (parse.data.title !== undefined) updateData.title = parse.data.title
    if (parse.data.description !== undefined) updateData.description = parse.data.description
    if (parse.data.category !== undefined) updateData.category = parse.data.category
    if (parse.data.imageUrl !== undefined) updateData.image_url = parse.data.imageUrl || null
    if (parse.data.status !== undefined) updateData.status = parse.data.status
    if (parse.data.rules !== undefined) updateData.rules = parse.data.rules || null

    const { data, error } = await supabase.from('communities').update(updateData).eq('id', req.params.id).select('*').single()
    if (error) throw error
    res.status(200).json({ success: true, data: data as Community } as ApiResponse<Community>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to update community', error)
    res.status(500).json({ success: false, error: 'Failed to update community', details: error.message } as ApiErrorResponse)
  }
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data: existing, error: fetchError } = await supabase.from('communities').select('created_by').eq('id', req.params.id).single()
    if (fetchError) throw fetchError
    if (existing.created_by !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiErrorResponse)
      return
    }
    const { error } = await supabase.from('communities').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).send()
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to delete community', error)
    res.status(500).json({ success: false, error: 'Failed to delete community', details: error.message } as ApiErrorResponse)
  }
})

router.post('/:id/join', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error: insertError } = await supabase.from('community_members').insert({
      community_id: req.params.id,
      user_id: req.user!.id,
      role: 'member',
    })
    if (insertError) throw insertError
    res.status(200).json({ success: true, data: { isMember: true } } as ApiResponse<{ isMember: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to join community', error)
    res.status(500).json({ success: false, error: 'Failed to join community', details: error.message } as ApiErrorResponse)
  }
})

router.post('/:id/leave', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', req.params.id)
      .eq('user_id', req.user!.id)
    if (error) throw error
    res.status(200).json({ success: true, data: { isMember: false } } as ApiResponse<{ isMember: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to leave community', error)
    res.status(500).json({ success: false, error: 'Failed to leave community', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:id/posts', async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = req.query
    const pageSize = Math.min(Number(limit || 10), 50)
    let query = supabase
      .from('posts')
      .select('*, author:profiles!posts_user_id_fkey(*)')
      .eq('community_id', req.params.id)
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
    console.error('Failed to list community posts', error)
    res.status(500).json({ success: false, error: 'Failed to list community posts', details: error.message } as ApiErrorResponse)
  }
})

export default router
