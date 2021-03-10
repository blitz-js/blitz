import {DefaultCtx, SessionContext, SimpleRolesIsAuthorized} from "blitz"
import React from "react"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized
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
