import { SimpleRolesIsAuthorized } from "@blitzjs/auth"
import { User } from "db"

export type Roles = "ADMIN" | "USER"

declare module "@blitzjs/auth" {
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<Roles>
    PublicData: {
      userId: User["id"]
      role: Roles
      views?: number
    }
  }
}
