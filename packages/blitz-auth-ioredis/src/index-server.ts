import {PublicData, SessionConfigMethods, SessionModel} from "@blitzjs/auth"
import Redis, {RedisOptions} from "ioredis"

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

const RedisStorage = (value: RedisOptions | Redis): SessionConfigMethods => {
  const redis = value instanceof Redis ? value : new Redis(value)

  return {
    async createSession(session: SessionModel): Promise<SessionModel> {
      let expires = 0
      if (session.expiresAt) {
        expires = (session.expiresAt.getTime() - Date.now()) / 1000
        session.expiresAt = session.expiresAt.getTime() as never
      }
      await redis.set(session.handle, JSON.stringify(session), "EX", expires)
      if (session.userId) {
        await redis.lpush(`user:${session.userId}`, session.handle)
      }
      return session
    },
    async deleteSession(handle: string): Promise<SessionModel> {
      const raw = await redis.get(handle)
      const session = raw ? JSON.parse(raw) : null
      if (session && session.userId) {
        await redis.lrem(`user:${session.userId}`, 0, handle)
      }
      return {handle}
    },
    async getSession(handle: string): Promise<SessionModel | null> {
      const raw = await redis.get(handle)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.expiresAt && typeof data.expiresAt === "number") {
          data.expiresAt = new Date(data.expiresAt!)
        }
        return data as SessionModel
      }
      return null
    },
    async getSessions(userId: PublicData["userId"]): Promise<SessionModel[]> {
      const handles = await redis.lrange(`user:${userId}`, 0, -1)
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
          await redis.lrem(`user:${oldSession.userId}`, 0, oldSession.handle)
          await redis.lpush(`user:${newSession.userId}`, handle)
        }
        return newSession
      }
      return undefined
    },
  }
}

export default RedisStorage
