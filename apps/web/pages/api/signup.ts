import {api} from "../../src/server-setup"
import {SessionContext} from "@blitzjs/auth"
import {prisma} from "../../prisma/index"
import {SecurePassword} from "@blitzjs/auth"

export default api(async (req, res) => {
  const blitzContext = res.blitzCtx as {session: SessionContext}

  const hashedPassword = await SecurePassword.hash(req.query.password || "test-password")
  const email = (req.query.email as string) || "test" + Math.random() + "@test.com"
  const user = await prisma.user.create({
    data: {email, hashedPassword, role: "user"},
    select: {id: true, name: true, email: true, role: true},
  })

  await blitzContext.session.$create({
    userId: user.id,
  })

  res.status(200).json({userId: blitzContext.session.userId, ...user, email: req.query.email})
})
