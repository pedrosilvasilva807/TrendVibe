import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import type { ApiResponse, ApiErrorResponse, UserProfile } from '../types'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

router.post('/login', async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  res.status(200).json({ success: true, data: { message: 'Use Supabase client login' } } as ApiResponse<{ message: string }>)
})

router.post('/register', async (req: Request, res: Response) => {
  const parse = registerSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  res.status(200).json({ success: true, data: { message: 'Use Supabase client signup' } } as ApiResponse<{ message: string }>)
})

router.post('/forgot-password', async (req: Request, res: Response) => {
  const parse = forgotPasswordSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ success: false, error: 'Invalid payload', details: parse.error.message } as ApiErrorResponse)
    return
  }
  res.status(200).json({ success: true, data: { message: 'Use Supabase client reset' } } as ApiResponse<{ message: string }>)
})

router.get('/me', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' } as ApiErrorResponse)
    }
    const userId = req.user.id
    console.debug('GET /api/auth/me for userId=', userId)
    
    // Try to get profile from database
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    
    if (data) {
      // Profile exists in DB
      console.debug('GET /api/auth/me: profile found, returning=', data)
      return res.status(200).json({ success: true, data: { user: data as UserProfile } } as ApiResponse<{ user: UserProfile }>)
    }
    
    if (error) {
      console.warn('GET /api/auth/me: profile query error=', error)
    }
    
    // If profile doesn't exist, return error (don't create fallback)
    // The trigger should have created it, or the user should call POST /profiles
    return next(new Error('Profile not found. Please complete your profile setup.'))
  } catch (err) {
    next(err)
  }
})

export default router
