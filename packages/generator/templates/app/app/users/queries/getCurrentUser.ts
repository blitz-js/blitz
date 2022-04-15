import { Ctx } from "blitz"
import { prisma } from "db"

export default async function getCurrentUser(_ = null, { session }: Ctx) {
  if (!session.userId) return null

  const user = await prisma.user.findFirst({
    where: { id: session.userId as number },
    select: { id: true, name: true, email: true, role: true },
  })

  return user
}
