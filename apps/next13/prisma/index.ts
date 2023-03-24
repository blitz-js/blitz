import {PrismaClient} from "@prisma/client"

export * from "@prisma/client"
const db = new PrismaClient()
export default db
