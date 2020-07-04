import db from "db"
import {SessionContext} from "@blitzjs/server"

type SignUpInput = {
  email: string
  password: string
}

type Ctx = {
  session?: SessionContext
}

export default async function signUp({email, password}: SignUpInput, ctx: Ctx = {}) {
  const user = await db.user.create({data: {email, hashedPassword: password, role: "user"}})

  if (user) {
    await ctx.session.create({userId: user.id, roles: [user.role]})
  }

  return user
}
