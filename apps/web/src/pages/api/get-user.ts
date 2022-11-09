import {api} from "src/blitz-server"
import db from "db"

export default api(async (_req, res, ctx) => {
  const blitzContext = ctx

  const publicData = blitzContext.session.$publicData

  const sessions = await db.session.findMany({})
  const sessionsCount = await db.session.count({})

  res.status(200).json({
    userId: blitzContext.session.userId,
    publicData: {...publicData},
    activeSessions: sessions,
    sessionsCount,
  })
})
