import {BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized} from "blitz"
import db from "./db"

const config: BlitzConfig = {
  // replace me
  middleware: [
    sessionMiddleware({
      cookiePrefix: "integration-auth",
      sessionExpiryMinutes: 15,
      isAuthorized: simpleRolesIsAuthorized,
      getSession: (handle) => {
        const session = db.get("sessions").find({handle}).value()
        if (!session) return session
        session.expiresAt = session.expiresAt ? new Date(session.expiresAt) : session.expiresAt
        return session
      },
      getSessions: (userId) => db.get("sessions").filter({userId}).value(),
      createSession: (session) => {
        return db.get("sessions").push(session).write()
      },
      updateSession: async (handle, session) => {
        return db.get("sessions").find({handle}).assign(session).write()
      },
      deleteSession: (handle) => db.get("sessions").remove({handle}).write(),
    }),
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
}
module.exports = config
