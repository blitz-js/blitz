import { NextConfig } from 'next/dist/next-server/server/config'
import { sessionMiddleware, simpleRolesIsAuthorized } from 'next/stdlib-server'
import db from './db'

const config: NextConfig = {
  // replace me
  middleware: [
    sessionMiddleware({
      cookiePrefix: 'auth-integration',
      domain: 'test',
      sessionExpiryMinutes: 15,
      isAuthorized: simpleRolesIsAuthorized,
      getSession: (handle) => db.get('sessions').find({ handle }).value(),
      getSessions: (userId) => db.get('sessions').filter({ userId }).value(),
      createSession: (session) => {
        return db.get('sessions').push(session).write()
      },
      updateSession: async (handle, session) => {
        return db.get('sessions').find({ handle }).assign(session).write()
      },
      deleteSession: (handle) => db.get('sessions').remove({ handle }).write(),
    }),
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {},
  future: {},
}
module.exports = config
