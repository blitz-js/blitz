import Redis from "ioredis"
import {createClient} from "redis"
import {PublicData, SessionConfigMethods, SessionModel} from "../../shared"

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

declare type RedisClient = ReturnType<typeof createClient> | Redis

export function isIoRedis(client: RedisClient): client is Redis {
  return client instanceof Redis
}

export function RedisStorageHelper(client: RedisClient) {
  return {
    get: async <T>(key: string): Promise<T | null | undefined> => {
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    },
    set: async (key: string, value: any, ttl: number = 0): Promise<void> => {
      if (isIoRedis(client)) {
        await client.set(key, JSON.stringify(value))
        if (ttl) {
          await client.expire(key, ttl)
        }
      } else {
        await client.set(key, JSON.stringify(value), {
          EX: ttl,
        })
      }
    },
    del: async (key: string): Promise<void> => {
      await client.del(key)
    },
    ladd: async (key: string, value: any): Promise<void> => {
      if (isIoRedis(client)) {
        await client.lpush(key, value)
      } else {
        await client.lPush(key, value)
      }
    },
    ldel: async (key: string, value: any): Promise<void> => {
      if (isIoRedis(client)) {
        await client.lrem(key, 0, value)
      } else {
        await client.lRem(key, 0, value)
      }
    },
    lall: async (key: string): Promise<string[]> => {
      if (isIoRedis(client)) {
        return await client.lrange(key, 0, -1)
      } else {
        return await client.lRange(key, 0, -1)
      }
    },
  }
}

// TODO? Maybe you need to store all handle keys and listen for redis key expiration events,
// remove the association between user and handle key in the expiration event
export const RedisStorage = (client: RedisClient): SessionConfigMethods => {
  const helper = RedisStorageHelper(client)
  return {
    async createSession(session: SessionModel): Promise<SessionModel> {
      let expires = 0
      if (session.expiresAt) {
        expires = (session.expiresAt.getTime() - Date.now()) / 1000
      }
      await helper.set(session.id, session, expires)
      if (session.userId) {
        await helper.ladd(`user:${session.userId}`, session.handle)
      }
      return session
    },
    async deleteSession(handle: string): Promise<SessionModel> {
      const session = await helper.get<SessionModel>(handle)
      await helper.del(handle)
      if (session && session.userId) {
        await helper.ldel(`user:${session.userId}`, handle)
      }
      return {handle}
    },
    async getSession(handle: string): Promise<SessionModel | null> {
      return (await helper.get<SessionModel>(handle)) || null
    },
    async getSessions(userId: PublicData["userId"]): Promise<SessionModel[]> {
      const handles = await helper.lall(`user:${userId}`)
      return Promise.all(handles.map((handle) => helper.get<SessionModel>(handle))).then(
        (sessions) => sessions.filter(Boolean),
      )
    },
    async updateSession(
      handle: string,
      session: Partial<SessionModel>,
    ): Promise<SessionModel | undefined> {
      const oldSession = await helper.get<SessionModel>(handle)
      if (oldSession) {
        const newSession = {...oldSession, ...session}
        await helper.set(handle, newSession)

        // maybe handle changed, so we need to update the user's session list
        if (newSession.userId) {
          await helper.ldel(`user:${oldSession.userId}`, oldSession.handle)
          await helper.ladd(`user:${newSession.userId}`, handle)
        }
        return newSession
      }
      return undefined
    },
  }
}
