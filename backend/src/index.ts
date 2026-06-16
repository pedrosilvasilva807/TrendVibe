import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar .env.local do diretório backend (subir 2 níveis de src/index.ts para backend/)
const envLocalPath = path.resolve(__dirname, '..', '.env.local')
dotenv.config({ path: envLocalPath })
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth'
import debugRoutes from './routes/debug'
import postsRoutes from './routes/posts'
import commentsRoutes from './routes/comments'
import communitiesRoutes from './routes/communities'
import profilesRoutes from './routes/profiles'
import chatRoutes from './routes/chat'
import keysRoutes from './routes/keys'
import { errorHandler } from './middleware/error'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim())
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

app.use('/api/auth', authRoutes)
app.use('/api/debug', debugRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/communities', communitiesRoutes)
app.use('/api/profiles', profilesRoutes)
app.use('/api/conversations', chatRoutes)
app.use('/api/messages', chatRoutes)
app.use('/api/keys', keysRoutes)

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Servir frontend compilado (React build)
const frontendDistPath = path.join(__dirname, '../../frontend/dist')
app.use(express.static(frontendDistPath))

// Fallback para React Router (SPA)
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'))
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`TrendVibe backend running on port ${PORT}`)
})
