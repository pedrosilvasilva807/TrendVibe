import type { Request, Response, NextFunction } from 'express'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Normalize error for JSON responses and logs
  let details: string
  if (err instanceof Error) {
    details = err.message
    console.error('Unhandled error:', { message: err.message, stack: err.stack })
  } else {
    try {
      details = JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2)
    } catch (e) {
      details = String(err)
    }
    console.error('Unhandled error (non-Error):', details)
  }

  res.status(500).json({ success: false, error: 'Internal server error', details })
}
