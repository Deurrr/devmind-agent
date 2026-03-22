import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { runCoderAgent } from '../agents/coder.js'
import type { Message, AgentEvent } from '../types/index.js'

const sendMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
})

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate)

  // POST /api/projects/:projectId/chat
  // Streams SSE events back to the client
  fastify.post<{ Params: { projectId: string } }>(
    '/:projectId/chat',
    async (request, reply) => {
      const body = sendMessageSchema.safeParse(request.body)
      if (!body.success) {
        return reply.code(400).send({ error: body.error.flatten() })
      }

      // Verify project belongs to user
      const project = await prisma.project.findFirst({
        where: { id: request.params.projectId, userId: request.user.userId },
      })
      if (!project) {
        return reply.code(404).send({ error: 'Project not found' })
      }

      // Get or create session
      let session = body.data.sessionId
        ? await prisma.session.findFirst({
            where: { id: body.data.sessionId, projectId: project.id },
          })
        : null

      if (!session) {
        session = await prisma.session.create({
          data: { projectId: project.id, messages: [], agentLog: [] },
        })
      }

      const history = session.messages as Message[]

      // Set SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL ?? '*',
        'X-Session-Id': session.id,
      })

      const sendEvent = (event: AgentEvent) => {
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
      }

      let fullAssistantResponse = ''
      const agentLog: AgentEvent[] = []

      try {
        const conversationHistory = history.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        for await (const event of runCoderAgent(
          body.data.message,
          conversationHistory
        )) {
          sendEvent(event)
          agentLog.push(event)

          if (event.type === 'token' && event.content) {
            fullAssistantResponse += event.content
          }
        }

        // Persist messages
        const updatedMessages: Message[] = [
          ...history,
          {
            role: 'user',
            content: body.data.message,
            timestamp: new Date().toISOString(),
          },
          {
            role: 'assistant',
            content: fullAssistantResponse,
            agentType: 'coder',
            timestamp: new Date().toISOString(),
          },
        ]

        await prisma.session.update({
          where: { id: session.id },
          data: {
            messages: updatedMessages,
            agentLog: [...(session.agentLog as AgentEvent[]), ...agentLog],
          },
        })

        sendEvent({ type: 'done' })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        sendEvent({ type: 'error', error: message })
      } finally {
        reply.raw.end()
      }
    }
  )

  // GET /api/projects/:projectId/sessions/:sessionId
  fastify.get<{ Params: { projectId: string; sessionId: string } }>(
    '/:projectId/sessions/:sessionId',
    async (request, reply) => {
      const project = await prisma.project.findFirst({
        where: { id: request.params.projectId, userId: request.user.userId },
      })
      if (!project) return reply.code(404).send({ error: 'Project not found' })

      const session = await prisma.session.findFirst({
        where: { id: request.params.sessionId, projectId: project.id },
        include: { generatedFiles: true },
      })

      if (!session) return reply.code(404).send({ error: 'Session not found' })
      return reply.send({ session })
    }
  )
}
