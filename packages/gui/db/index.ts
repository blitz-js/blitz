import {PrismaClient} from '@prisma/client'

export * from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // @ts-ignore
  global['prisma'] = global['prisma'] || new PrismaClient()
  // @ts-ignore
  prisma = global['prisma']
}

export default prisma
