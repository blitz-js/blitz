import { api } from "src/blitz-server"
import GithubProvider from "next-auth/providers/github"
import { NextAuthAdapter, BlitzNextAuthOptions } from "@blitzjs/auth"
import db, { User } from "db"
import { Role } from "types"

const config: BlitzNextAuthOptions = {
  successRedirectUrl: "/",
  failureRedirectUrl: "/",
  providers: [
    GithubProvider({
      clientId: "dcd02983e7e911bd169f",
      clientSecret: "86d8f87ec03c980e313e5fa3e23ec3e9878d74b1",
    }),
  ],
  callback: async (user, account, profile, session) => {
    console.log("USER SIDE PROFILE_DATA", { user, account, profile, session })
    let newUser: User
    try {
      newUser = await db.user.findFirstOrThrow({ where: { name: { equals: user.name } } })
    } catch (e) {
      newUser = await db.user.create({
        data: {
          email: user.email as string,
          name: user.name as string,
          role: "USER",
        },
      })
    }
    const publicData = {
      userId: newUser.id,
      role: newUser.role as Role,
      source: "mock_client1",
    }
    await session.$create(publicData)
  },
}

export default api(NextAuthAdapter(config))
