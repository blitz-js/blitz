import {enhancePrisma} from "blitz"
import {PrismaClient} from "@prisma/client"

const EnhancedPrisma = enhancePrisma(PrismaClient)

export * from "@prisma/client"
const prisma = new EnhancedPrisma()
export default prisma
