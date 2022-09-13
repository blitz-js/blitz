import {enhancePrisma} from "blitz"
import {PrismaClient} from "@prisma/client"

const EnhancedPrisma = enhancePrisma(PrismaClient)
const prisma = new EnhancedPrisma()
export default prisma
