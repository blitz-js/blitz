import { api } from "src/blitz-server"
import GithubProvider from "@auth/core/providers/github"
import { AuthAdapter } from "@blitzjs/auth/adapters/authjs"
import db, { User } from "db"
import { Role } from "types"

// Has to be defined separately for `profile` to be correctly typed below
const providers = [
  GithubProvider({
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  }),
]

export default api(
  AuthAdapter({
    successRedirectUrl: "/",
    errorRedirectUrl: "/error",
    providers,
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    callback: async (user, account, profile, session) => {
      console.log("USER SIDE PROFILE_DATA", { user, account, profile })
      let newUser: User
      if (!user) throw new Error("No user found")
      try {
        newUser = await db.user.findFirstOrThrow({ where: { name: { equals: user.name } } })
      } catch (e) {
        newUser = await db.user.create({
          data: {
            email: user.email ?? "",
            name: user.name ?? "",
            role: "USER",
          },
        })
      }
      const publicData = {
        userId: newUser.id,
        role: newUser.role as Role,
        source: "github",
      }
      await session.$create(publicData)
      return { redirectUrl: "/" }
    },
  })
)
