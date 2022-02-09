import {api} from "../../src/server-setup"
import {SessionContext} from "@blitzjs/auth"
import {prisma} from "../../prisma/index"

export default api(async (req, res) => {
  const blitzContext = res.blitzCtx as {session: SessionContext}

  const publicData = blitzContext.session.$publicData

  const sessions = await prisma.session.findMany({})
  const sessionsCount = await prisma.session.count({})

  res
    .status(200)
    .json({
      userId: blitzContext.session.userId,
      publicData: {...publicData},
      activeSessions: sessions,
      sessionsCount,
    })
})
