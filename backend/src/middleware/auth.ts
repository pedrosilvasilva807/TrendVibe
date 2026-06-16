import type { Request, Response, NextFunction } from 'express'
import { verifySupabaseToken } from '../lib/supabase'
import type { AuthenticatedUser } from '../types'

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
      token?: string
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    // Log presence of token (masked) for debugging — do not log full token
    const masked = token.length > 10 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token
    console.debug('authMiddleware: Authorization header present, token:', masked)
    const user = await verifySupabaseToken(token)
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid token' })
      return
    }
    req.user = { id: user.id, email: user.email }
    // expose raw token for downstream handlers that may need to call GoTrue
    req.token = token
    next()
  } catch (err) {
    console.error('authMiddleware error:', err)
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}
