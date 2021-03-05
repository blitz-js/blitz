import {enhancePrisma} from "blitz"
import {PrismaClient} from "./generated-client"

const EnhancedPrisma = enhancePrisma(PrismaClient)

export * from "@prisma/client"
export default new EnhancedPrisma()
