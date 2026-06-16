import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar .env.local
const envLocalPath = path.resolve(__dirname, '..', 'backend', '.env.local')
dotenv.config({ path: envLocalPath })
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import authRoutes from '../backend/src/routes/auth'
import debugRoutes from '../backend/src/routes/debug'
import postsRoutes from '../backend/src/routes/posts'
import commentsRoutes from '../backend/src/routes/comments'
import communitiesRoutes from '../backend/src/routes/communities'
import profilesRoutes from '../backend/src/routes/profiles'
import chatRoutes from '../backend/src/routes/chat'
import keysRoutes from '../backend/src/routes/keys'
import { errorHandler } from '../backend/src/middleware/error'

const app = express()

app.use(helmet())
const allowedOrigins = (process.env.FRONTEND_URL || 'https://trendvibe-phi.vercel.app').split(',').map(s => s.trim())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      try {
        const url = new URL(origin)
        const hostname = url.hostname
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
        const isPrivateNetwork = hostname.startsWith('192.168.') || hostname.startsWith('169.254.')
        if (allowedOrigins.includes(origin) || isLocalhost || isPrivateNetwork) return callback(null, true)
      } catch (e) {
        // fall through
      }
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

app.use('/auth', authRoutes)
app.use('/debug', debugRoutes)
app.use('/posts', postsRoutes)
app.use('/comments', commentsRoutes)
app.use('/communities', communitiesRoutes)
app.use('/profiles', profilesRoutes)
app.use('/conversations', chatRoutes)
app.use('/messages', chatRoutes)
app.use('/keys', keysRoutes)

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(errorHandler)

export default app
