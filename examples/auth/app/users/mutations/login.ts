import db from "db"
import {AuthenticationError} from "blitz"
import {SessionContext} from "@blitzjs/server"

type LoginInput = {
  email: string
  password: string
}

type Ctx = {session?: SessionContext}

export default async function login({email, password}: LoginInput, ctx: Ctx = {}) {
  const user = await db.user.findOne({where: {email}})

  if (!user || password !== user.hashedPassword) {
    throw new AuthenticationError()
  }

  console.log(ctx.session)
  await ctx.session.create({userId: user.id, roles: [user.role]})

  return user
}
