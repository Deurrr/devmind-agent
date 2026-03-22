import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export async function projectRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate)

  // GET /api/projects
  fastify.get('/', async (request, reply) => {
    const projects = await prisma.project.findMany({
      where: { userId: request.user.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { sessions: true } },
      },
    })
    return reply.send({ projects })
  })

  // POST /api/projects
  fastify.post('/', async (request, reply) => {
    const body = createProjectSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() })
    }

    const project = await prisma.project.create({
      data: {
        userId: request.user.userId,
        title: body.data.title,
        description: body.data.description,
      },
    })

    return reply.code(201).send({ project })
  })

  // GET /api/projects/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const project = await prisma.project.findFirst({
      where: { id: request.params.id, userId: request.user.userId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, createdAt: true, updatedAt: true },
        },
      },
    })

    if (!project) return reply.code(404).send({ error: 'Project not found' })
    return reply.send({ project })
  })

  // DELETE /api/projects/:id
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const project = await prisma.project.findFirst({
      where: { id: request.params.id, userId: request.user.userId },
    })

    if (!project) return reply.code(404).send({ error: 'Project not found' })

    await prisma.project.delete({ where: { id: project.id } })
    return reply.send({ success: true })
  })
}
