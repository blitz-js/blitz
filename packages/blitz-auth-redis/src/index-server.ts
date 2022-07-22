import {PublicData, SessionConfigMethods, SessionModel} from "@blitzjs/auth"
import {createClient} from "redis"

type Falsy = false | 0 | "" | null | undefined

// typescript helper to filter out falsy values
declare global {
  interface Array<T> {
    filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[]
  }

  interface ReadonlyArray<T> {
    filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[]
  }
}

declare type CreateClient = typeof createClient
declare type RedisClientOptions = NonNullable<Parameters<CreateClient>[0]>
declare type RedisClientType = ReturnType<CreateClient>

function isRedisClient(value: RedisClientOptions | RedisClientType): value is RedisClientType {
  return "isReady" in value
}

const RedisStorage = (value: RedisClientOptions | RedisClientType): SessionConfigMethods => {
  const redis = isRedisClient(value) ? value : createClient(value)

  return {
    async createSession(session: SessionModel): Promise<SessionModel> {
      let expires = 0
      if (session.expiresAt) {
        expires = (session.expiresAt.getTime() - Date.now()) / 1000
      }
      await redis.set(session.id, JSON.stringify(session), {
        EX: expires,
      })
      if (session.userId) {
        await redis.lPush(`user:${session.userId}`, session.handle)
      }
      return session
    },
    async deleteSession(handle: string): Promise<SessionModel> {
      const raw = await redis.get(handle)
      const session = raw ? JSON.parse(raw) : null
      if (session && session.userId) {
        await redis.lRem(`user:${session.userId}`, 0, handle)
      }
      return {handle}
    },
    async getSession(handle: string): Promise<SessionModel | null> {
      const raw = await redis.get(handle)
      return raw ? (JSON.parse(raw) as SessionModel) : null
    },
    async getSessions(userId: PublicData["userId"]): Promise<SessionModel[]> {
      const handles = await redis.lRange(`user:${userId}`, 0, -1)
      return Promise.all(handles.map((handle: string) => this.getSession(handle))).then(
        (sessions) => sessions.filter(Boolean),
      )
    },
    async updateSession(
      handle: string,
      session: Partial<SessionModel>,
    ): Promise<SessionModel | undefined> {
      const oldSession = await this.getSession(handle)
      if (oldSession) {
        const newSession = {...oldSession, ...session} as SessionModel
        await redis.set(handle, JSON.stringify(newSession))

        // maybe handle changed, so we need to update the user's session list
        if (newSession.userId) {
          await redis.lRem(`user:${oldSession.userId}`, 0, oldSession.handle)
          await redis.lPush(`user:${newSession.userId}`, handle)
        }
        return newSession
      }
      return undefined
    },
  }
}

export default RedisStorage
