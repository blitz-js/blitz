import { BlitzPlugin, Middleware } from "@blitzjs/next"
import { assert } from "blitz"
import { Ctx, PublicData, SessionModel } from "../shared/types"
import { getSession } from "./auth-sessions"

interface SessionConfigOptions {
  cookiePrefix?: string
  sessionExpiryMinutes?: number
  method?: 'essential' | 'advanced'
  sameSite?: 'none' | 'lax' | 'strict'
  secureCookies?: boolean
  domain?: string
  publicDataKeysToSyncAcrossSessions?: string[]
}

interface SessionConfigMethods {
  getSession: (handle: string) => Promise<SessionModel | null>
  getSessions: (userId: PublicData['userId']) => Promise<SessionModel[]>
  createSession: (session: SessionModel) => Promise<SessionModel>
  updateSession: (
    handle: string,
    session: Partial<SessionModel>
  ) => Promise<SessionModel>
  deleteSession: (handle: string) => Promise<SessionModel>
}

interface IsAuthorized {
  isAuthorized: (data: { ctx: Ctx; args: any }) => boolean
}

export const PrismaStorage = (db: any /* todo */): SessionConfigMethods => {
  return {
    getSession: (handle) => db.session.findFirst({ where: { handle } }),
    getSessions: (userId) => db.session.findMTemporaryAny({ where: { userId } }),
    createSession: (session) => {
      let user
      if (session.userId) {
        user = { connect: { id: session.userId } }
      }
      return db.session.create({
        data: { ...session, userId: undefined, user },
      })
    },
    updateSession: async (handle, session) => {
      try {
        return await db.session.update({ where: { handle }, data: session })
      } catch (error: any) {
        // Session doesn't exist in DB for some reason, so create it
        if (error.code === 'P2016') {
          console.warn(
            "Could not update session because it's not in the DB"
          )
        } else {
          throw error
        }
      }
    },
    deleteSession: (handle) => db.session.delete({ where: { handle } }),
  }
}

const defaultConfig_: SessionConfigOptions = ({
  sessionExpiryMinutes: 30 * 24 * 60, // Sessions expire after 30 days of being idle
  method: 'essential',
  sameSite: 'lax',
  publicDataKeysToSyncAcrossSessions: ['role', 'roles'],
  secureCookies:
    !process.env.DISABLE_SECURE_COOKIES &&
    process.env.NODE_ENV === 'production',
})

interface AuthPluginOptions extends Partial<SessionConfigOptions>, IsAuthorized {
  storage: SessionConfigMethods
}

export function AuthServerPlugin(options: AuthPluginOptions): BlitzPlugin {
  function authPluginSessionMiddleware() {
    assert(
      options.isAuthorized,
      'You must provide an authorization implementation to sessionMiddleware as isAuthorized(userRoles, input)'
    )

      ; (global as any).sessionConfig = {
        ...defaultConfig_,
        ...options.storage,
        ...options,
      }

    const cookiePrefix = (global as any).sessionConfig.cookiePrefix ?? 'blitz'
    assert(
      cookiePrefix.match(/^[a-zA-Z0-9-_]+$/),
      `The cookie prefix used has invalid characters. Only alphanumeric characters, "-"  and "_" character are supported`
    )

    const blitzSessionMiddleware: Middleware = async (req, res, next) => {
      console.log('Starting sessionMiddleware...')
      if (!res.blitzCtx) {
        await getSession(req, res)
      }
      return next()
    }

    // todo
    // blitzSessionMiddleware.config = {
    //   name: 'blitzSessionMiddleware',
    //   cookiePrefix,
    // }
    return blitzSessionMiddleware
  }
  return {
    middlewares: [
      authPluginSessionMiddleware()
    ],
  }
}
