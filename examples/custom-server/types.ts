import {DefaultCtx, SessionContext} from "blitz"
import {simpleRolesIsAuthorized} from "@blitzjs/server"
import React from "react"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: typeof simpleRolesIsAuthorized
    PublicData: {
      userId: number
    }
  }
}

// This should not be needed. Usually it isn't but for some reason in this example it is
declare module "react" {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}
