import { PrismaClient } from "@prisma/client"
export * from "@prisma/client"

let prisma

if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient()
} else {
    // Ensure the prisma instance is re-used during hot-reloading
    // Otherwise, we will spawn a new client on every reload
    global.prisma = global.prisma || new PrismaClient()
    prisma = global.prisma
}

export default prisma
