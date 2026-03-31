import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import helmet from '@fastify/helmet'
import { authRoutes } from './routes/auth.js'
import { projectRoutes } from './routes/projects.js'
import { chatRoutes } from './routes/chat.js'
import { exportRoutes } from './routes/export.js'
import { redis } from './lib/redis.js'
import type { JwtPayload } from './types/index.js'

const isProd = process.env.NODE_ENV === 'production'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: isProd ? 'warn' : 'info',
    },
  })

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Handled by Next.js frontend
    crossOriginEmbedderPolicy: false,
  })

  // CORS
  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })

  // Cookie
  await app.register(cookie)

  // JWT — fail hard in prod if secret is default
  const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
  if (isProd && jwtSecret === 'dev-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production')
  }
  await app.register(jwt, { secret: jwtSecret })

  // Global rate limit — 100 req/min per IP
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    redis,
    errorResponseBuilder: () => ({
      error: 'Too many requests, please slow down.',
      statusCode: 429,
    }),
  })

  // Decorate with authenticate helper
  app.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  // Type augmentation for JWT user payload
  app.addHook('onRequest', async (request) => {
    if (request.headers.authorization) {
      try {
        const payload = await request.jwtVerify<JwtPayload>()
        request.user = payload
      } catch {
        // Will be caught by authenticate hook on protected routes
      }
    }
  })

  // Routes — auth gets stricter rate limit (20 req/min)
  await app.register(
    async (instance) => {
      await instance.register(rateLimit, {
        max: 20,
        timeWindow: '1 minute',
        redis,
        errorResponseBuilder: () => ({
          error: 'Too many auth attempts, please try again later.',
          statusCode: 429,
        }),
      })
      await instance.register(authRoutes)
    },
    { prefix: '/api/auth' }
  )

  // Chat routes get AI-specific rate limit (30 req/min)
  await app.register(
    async (instance) => {
      await instance.register(rateLimit, {
        max: 30,
        timeWindow: '1 minute',
        redis,
        errorResponseBuilder: () => ({
          error: 'AI request limit reached, please wait a moment.',
          statusCode: 429,
        }),
      })
      await instance.register(chatRoutes)
    },
    { prefix: '/api/projects' }
  )

  await app.register(projectRoutes, { prefix: '/api/projects' })
  await app.register(exportRoutes, { prefix: '/api/projects' })

  // Health check (excluded from rate limiting via high global limit)
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}
