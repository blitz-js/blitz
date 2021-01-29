import {resolver, SecurePassword} from "blitz"
import db from "db"
import * as z from "zod"

export const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(100),
})

export default resolver.pipe(resolver.zod(SignupInput), async ({email, password}, {session}) => {
  const hashedPassword = await SecurePassword.hash(password)
  const user = await db.user.create({
    data: {email, hashedPassword, role: "user"},
    select: {id: true, name: true, email: true, role: true},
  })

  await session.$create({userId: user.id, roles: [user.role]})

  return user
})
