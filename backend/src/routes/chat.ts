import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import type { ApiResponse, ApiErrorResponse, Conversation, Message } from '../types'

const router = Router()

const sendMessageSchema = z.object({
  recipientId: z.string().uuid(),
  encryptedContent: z.string(),
  iv: z.string(),
})

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, participant_a:profiles!conversations_participant_a_fkey(*), participant_b:profiles!conversations_participant_b_fkey(*)')
      .or(`participant_a.eq.${req.user!.id},participant_b.eq.${req.user!.id}`)
      .order('updated_at', { ascending: false })
    if (error) throw error
    const conversations = ((data || []) as (Conversation & { participant_a_profile?: unknown; participant_b_profile?: unknown })[]).map((conversation) => {
      const otherProfile = conversation.participant_a === req.user!.id ? conversation.participant_b_profile : conversation.participant_a_profile
      return { ...conversation, other_participant: otherProfile }
    })
    res.status(200).json({
      success: true,
      data: { data: conversations, nextCursor: null, hasMore: false },
    } as ApiResponse<{ data: (Conversation & { other_participant: unknown })[]; nextCursor: null; hasMore: false }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list conversations', error)
    res.status(500).json({ success: false, error: 'Failed to list conversations', details: error.message } as ApiErrorResponse)
  }
})

router.post('/:recipientId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const a = req.user!.id
    const b = req.params.recipientId
    const [participantA, participantB] = a < b ? [a, b] : [b, a]
    let { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant_a', participantA)
      .eq('participant_b', participantB)
      .maybeSingle()
    if (fetchError) throw fetchError
    if (!existing) {
      const { data: created, error: insertError } = await supabase
        .from('conversations')
        .insert({ participant_a: participantA, participant_b: participantB })
        .select('*')
        .single()
      if (insertError) throw insertError
      existing = created
    }
    res.status(200).json({ success: true, data: { conversation: existing as Conversation } } as ApiResponse<{ conversation: Conversation }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to get or create conversation', error)
    res.status(500).json({ success: false, error: 'Failed to get or create conversation', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:id/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = req.query
    const pageSize = Math.min(Number(limit || 50), 100)
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participant_a, participant_b')
      .eq('id', req.params.id)
      .single()
    if (!conversation || (conversation.participant_a !== req.user!.id && conversation.participant_b !== req.user!.id)) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiErrorResponse)
      return
    }
    let query = supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1)
    if (cursor) {
      query = query.lt('created_at', cursor as string)
    }
    const { data, error } = await query
    if (error) throw error
    const items = (data || []) as Message[]
    const hasMore = items.length > pageSize
    const result = hasMore ? items.slice(0, pageSize) : items
    const nextCursor = hasMore ? data![pageSize].created_at : null
    res.status(200).json({
      success: true,
      data: { data: result.reverse(), nextCursor, hasMore },
    } as ApiResponse<{ data: Message[]; nextCursor: string | null; hasMore: boolean }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to list messages', error)
    res.status(500).json({ success: false, error: 'Failed to list messages', details: error.message } as ApiErrorResponse)
  }
})

router.post('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', req.params.id)
      .neq('sender_id', req.user!.id)
      .eq('is_read', false)
    if (error) throw error
    res.status(204).send()
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to mark messages as read', error)
    res.status(500).json({ success: false, error: 'Failed to mark messages as read', details: error.message } as ApiErrorResponse)
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parse = sendMessageSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const a = req.user!.id
    const b = parse.data.recipientId
    const [participantA, participantB] = a < b ? [a, b] : [b, a]
    let { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant_a', participantA)
      .eq('participant_b', participantB)
      .maybeSingle()
    if (convError) throw convError
    if (!conversation) {
      const { data: created, error: insertError } = await supabase
        .from('conversations')
        .insert({ participant_a: participantA, participant_b: participantB })
        .select('id')
        .single()
      if (insertError) throw insertError
      conversation = created
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: req.user!.id,
        encrypted_content: parse.data.encryptedContent,
        iv: parse.data.iv,
      })
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .single()
    if (error) throw error
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation.id)
    res.status(201).json({ success: true, data: data as Message } as ApiResponse<Message>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to send message', error)
    res.status(500).json({ success: false, error: 'Failed to send message', details: error.message } as ApiErrorResponse)
  }
})

export default router
