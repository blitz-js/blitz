import {PrismaClient} from '@prisma/client'
export * from '@prisma/client'

let db = (undefined as unknown) as PrismaClient

if (typeof window === 'undefined') {
  db = new PrismaClient({log: ['info', 'query']})
  db.connect()
}

export default db
