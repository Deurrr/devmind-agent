import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { runOrchestrator } from '../services/orchestrator.js'
import type { Message, AgentEvent, AgentType } from '../types/index.js'

const sendMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
  githubToken: z.string().optional(),
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

      const history = session.messages as unknown as Message[]

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

      // Track each agent's output separately
      const agentLog: AgentEvent[] = []
      const agentMessages: Message[] = []
      let currentAgent: AgentType | null = null
      let currentContent = ''

      try {
        for await (const event of runOrchestrator(body.data.message, history, body.data.githubToken)) {
          sendEvent(event)
          agentLog.push(event)

          if (event.type === 'agent_start' && event.agent) {
            currentAgent = event.agent
            currentContent = ''
          } else if (event.type === 'token' && event.content) {
            currentContent += event.content
          } else if (event.type === 'agent_done' && event.agent && currentContent) {
            agentMessages.push({
              role: 'assistant',
              content: currentContent,
              agentType: currentAgent ?? undefined,
              timestamp: new Date().toISOString(),
            })
            currentAgent = null
            currentContent = ''
          }
        }

        // Persist all messages (user + one per agent)
        const updatedMessages: Message[] = [
          ...history,
          {
            role: 'user',
            content: body.data.message,
            timestamp: new Date().toISOString(),
          },
          ...agentMessages,
        ]

        await prisma.session.update({
          where: { id: session.id },
          data: {
            messages: updatedMessages as unknown as Parameters<typeof prisma.session.update>[0]['data']['messages'],
            agentLog: [...(session.agentLog as unknown as AgentEvent[]), ...agentLog] as unknown as Parameters<typeof prisma.session.update>[0]['data']['agentLog'],
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
