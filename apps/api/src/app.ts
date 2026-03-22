import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import { authRoutes } from './routes/auth.js'
import { projectRoutes } from './routes/projects.js'
import { chatRoutes } from './routes/chat.js'
import { redis } from './lib/redis.js'
import type { JwtPayload } from './types/index.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
  })

  // CORS
  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })

  // Cookie
  await app.register(cookie)

  // JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  })

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis,
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

  // Routes
  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(projectRoutes, { prefix: '/api/projects' })
  await app.register(chatRoutes, { prefix: '/api/projects' })

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}
