import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import type { ApiResponse, ApiErrorResponse } from '../types'

const router = Router()

const saveKeySchema = z.object({
  publicKey: z.record(z.any()),
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parse = saveKeySchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  try {
    const { error } = await supabase
      .from('public_keys')
      .upsert({ user_id: req.user!.id, public_key: parse.data.publicKey }, { onConflict: 'user_id' })
    if (error) throw error
    res.status(204).send()
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to save public key', error)
    res.status(500).json({ success: false, error: 'Failed to save public key', details: error.message } as ApiErrorResponse)
  }
})

router.get('/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('public_keys').select('public_key').eq('user_id', req.params.userId).single()
    if (error) throw error
    res.status(200).json({ success: true, data: { publicKey: data.public_key } } as ApiResponse<{ publicKey: JsonWebKey }>)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to get public key', error)
    res.status(500).json({ success: false, error: 'Failed to get public key', details: error.message } as ApiErrorResponse)
  }
})

export default router
