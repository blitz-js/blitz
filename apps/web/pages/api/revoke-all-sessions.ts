import {api} from "app/blitz-server"
import db from "db"

export default api(async (_req, res) => {
  const sessions = await db.session.deleteMany()
  const sessionsCount = await db.session.count()

  res.status(200).json({
    activeSessions: sessions,
    sessionsCount,
  })
})
