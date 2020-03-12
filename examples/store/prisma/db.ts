import {PrismaClient} from '@prisma/client'
export * from '@prisma/client'

export const isServer = typeof window === 'undefined'

let db: PrismaClient
export default function() {
  if (isServer) {
    db = new PrismaClient({log: ['info', 'query']})
    db.connect()
  }
  return db
}
