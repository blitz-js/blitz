import {PrismaClient} from '@prisma/client'
export * from '@prisma/client'

let db = (undefined as unknown) as PrismaClient

if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
  db = new PrismaClient(process.env.NODE_ENV === 'test' ? {} : {log: ['info', 'query']})
  db.connect()
}

export default db
