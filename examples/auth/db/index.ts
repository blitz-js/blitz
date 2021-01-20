import {enhancePrisma} from "blitz"
import {PrismaClient} from "@prisma/client"

const BlitzPrisma = enhancePrisma(PrismaClient)

export * from "@prisma/client"
const db = new BlitzPrisma()

// TODO fix type here
db.$reset
