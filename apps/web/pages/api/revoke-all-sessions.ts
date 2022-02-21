import {api} from "../../src/server-setup"
import {prisma} from "../../prisma/index"

export default api(async (_req, res) => {
  const sessions = await prisma.session.deleteMany()
  const sessionsCount = await prisma.session.count()

  res.status(200).json({
    activeSessions: sessions,
    sessionsCount,
  })
})
