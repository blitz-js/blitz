import { BlitzPlugin, Middleware } from "@blitzjs/next"
import { Ctx, PublicData, SessionModel } from "../shared/types"
import { getSession } from "./auth-sessions"

type TemporaryAny = any

function assert(condition: TemporaryAny, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export interface SessionContextBase {
  $handle: string | null
  $publicData: unknown
  $authorize(
    ...args: TemporaryAny
  ): asserts this is AuthenticatedSessionContext
  $isAuthorized: (...args: TemporaryAny) => boolean
  $create: (
    publicData: PublicData,
    privateData?: Record<TemporaryAny, TemporaryAny>
  ) => Promise<void>
  $revoke: () => Promise<void>
  $revokeAll: () => Promise<void>
  $getPrivateData: () => Promise<Record<TemporaryAny, TemporaryAny>>
  $setPrivateData: (data: Record<TemporaryAny, TemporaryAny>) => Promise<void>
  $setPublicData: (data: Partial<Omit<PublicData, 'userId'>>) => Promise<void>
}

export interface EmptyPublicData extends Partial<Omit<PublicData, 'userId'>> {
  userId: PublicData['userId'] | null
}
export interface SessionContext extends SessionContextBase, EmptyPublicData {
  $publicData: Partial<PublicData> | EmptyPublicData
}
export interface AuthenticatedSessionContext
  extends SessionContextBase,
  PublicData {
  userId: PublicData['userId']
  $publicData: PublicData
}

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
  isAuthorized: (data: { ctx: Ctx; args: TemporaryAny }) => boolean
}

export interface SessionConfig extends SessionConfigOptions, IsAuthorized {
  storage: SessionConfigMethods
}

export const PrismaStorage = (db: TemporaryAny): SessionConfigMethods => {
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
      } catch (error: TemporaryAny) {
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

      ; (global as TemporaryAny).sessionConfig = {
        ...defaultConfig_,
        ...options.storage,
        ...options,
      }

    const cookiePrefix = (global as TemporaryAny).sessionConfig.cookiePrefix ?? 'blitz'
    assert(
      cookiePrefix.match(/^[a-zA-Z0-9-_]+$/),
      `The cookie prefix used has invalid characters. Only alphanumeric characters, "-"  and "_" character are supported`
    )

    const blitzSessionMiddleware: Middleware = async (req, res, next) => {
      console.log('Starting sessionMiddleware...')
      if (!(res.blitzCtx as TemporaryAny)) {
        res.blitzCtx = { userId: "test" } // todo: hardcoded
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
