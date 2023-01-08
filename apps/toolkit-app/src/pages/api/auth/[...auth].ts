import { api } from "src/blitz-server"
import GithubProvider from "next-auth/providers/github"
import { NextAuthAdapter, BlitzNextAuthOptions } from "@blitzjs/auth"

const config: BlitzNextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: "dcd02983e7e911bd169f",
      clientSecret: "86d8f87ec03c980e313e5fa3e23ec3e9878d74b1",
    }),
  ],
  callback: async (user, account, profile, ctx) => {
    console.log("USER SIDE PROFILE_DATA", { user, account, profile, ctx })
  },
}

export default api(NextAuthAdapter(config))
