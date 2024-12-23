import {oAuth2Handler} from "@blitzjs/auth"
import {GitHub, Google} from "arctic"

export const {GET} = oAuth2Handler([
  {
    client: new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, null),
    name: "github",
    scopes: ["user:email"],
    withPkce: false,
  },
  {
    client: new Google(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      "https://localhost:3000/api/auth/google/callback",
    ),
    name: "google",
    scopes: ["email", "profile"],
    withPkce: true,
  },
])
