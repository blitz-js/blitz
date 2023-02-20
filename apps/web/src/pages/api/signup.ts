import {api} from "src/blitz-server"
import db from "db"
import {SecurePassword} from "@blitzjs/auth"

export default api(async (req, res, ctx) => {
  const blitzContext = ctx

  const hashedPassword = await SecurePassword.hash(
    (req.query.password as string) || "test-password",
  )
  const email = (req.query.email as string) || "test" + Math.random() + "@test.com"
  const user = await db.user.create({
    data: {email, hashedPassword, role: "user"},
    select: {id: true, name: true, email: true, role: true},
  })

  await blitzContext.session.$create({
    userId: user.id,
    role: "USER",
  })

  res.status(200).json({userId: blitzContext.session.userId, ...user, email: req.query.email})
})
