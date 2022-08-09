import { SessionContext } from "@blitzjs/auth";

// Note: You should switch to Postgres and then use a DB enum for role type
export type Role = "ADMIN" | "USER"

declare module "@blitzjs/auth" {
  export interface Ctx {
    session: SessionContext
  }
  export interface Session {
    PublicData: {
      userId: string
      roles: Role[]
    }
  }
}
