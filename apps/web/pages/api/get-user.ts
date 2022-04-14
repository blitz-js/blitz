import {api} from "app/blitz-server"
import {SessionContext} from "@blitzjs/auth"
import {prisma} from "../../prisma/index"

export default api(async (_req, res, ctx) => {
  const blitzContext = ctx

  const publicData = blitzContext.session.$publicData

  const sessions = await prisma.session.findMany({})
  const sessionsCount = await prisma.session.count({})

  res.status(200).json({
    userId: blitzContext.session.userId,
    publicData: {...publicData},
    activeSessions: sessions,
    sessionsCount,
  })
})
