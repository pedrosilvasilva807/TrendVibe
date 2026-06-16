import { Router, Request, Response } from 'express'

const router = Router()

// Simple debug endpoint to inspect whether Authorization header is present.
// Returns a masked token (not the full secret) and header existence.
router.get('/auth', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(200).json({ success: true, data: { hasAuthorization: false } })
  }
  const parts = authHeader.split(' ')
  const token = parts[1] || ''
  const masked = token.length > 10 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token
  return res.status(200).json({ success: true, data: { hasAuthorization: true, scheme: parts[0] || null, maskedToken: masked } })
})

export default router
