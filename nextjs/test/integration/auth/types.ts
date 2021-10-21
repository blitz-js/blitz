import { DefaultCtx, SessionContext } from 'next/types'
import { SimpleRolesIsAuthorized } from 'next/stdlib-server'

declare module 'next/types' {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<'user'>
    PublicData: {
      userId: number
      role: 'user'
    }
  }
}
