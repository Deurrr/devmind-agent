import { buildApp } from './app.js'
import { prisma } from './lib/prisma.js'
import { redis } from './lib/redis.js'

const PORT = parseInt(process.env.PORT ?? '3001', 10)

async function main() {
  const app = await buildApp()

  // Connect to Redis
  await redis.connect()

  // Start server
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`[API] Server running on http://localhost:${PORT}`)
}

main().catch(async (err) => {
  console.error('[API] Fatal error:', err)
  await prisma.$disconnect()
  await redis.quit()
  process.exit(1)
})
