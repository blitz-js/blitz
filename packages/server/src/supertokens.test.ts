import {apiResolver} from "next/dist/next-server/server/api-utils"
import http from "http"
import listen from "test-listen"
import fetch from "isomorphic-unfetch"
import {
  EnhancedResolverModule,
  HEADER_CSRF,
  HEADER_PUBLIC_DATA_TOKEN,
  COOKIE_ANONYMOUS_SESSION_TOKEN,
  COOKIE_SESSION_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  TOKEN_SEPARATOR,
  SessionContext,
} from "@blitzjs/core"
import {rpcApiHandler} from "./rpc"
import {atob} from "b64-lite"

import {sessionMiddleware, unstable_simpleRolesIsAuthorized} from "./supertokens"

const isIsoDate = (str: string) => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false
  var d = new Date(str)
  return d.toISOString() === str
}

export function readCookie(cookieHeader: string, name: string) {
  const setPos = cookieHeader.search(new RegExp("\\b" + name + "="))
  const stopPos = cookieHeader.indexOf(";", setPos)
  let res
  if (!~setPos) return undefined
  res = decodeURIComponent(
    cookieHeader.substring(setPos, ~stopPos ? stopPos : undefined).split("=")[1],
  )
  return res.charAt(0) === "{" ? JSON.parse(res) : res
}

type CtxWithSession = {
  session: SessionContext
}

describe("supertokens", () => {
  it("anonymous", async () => {
    const resolverModule = ((() => {
      return
    }) as unknown) as EnhancedResolverModule
    resolverModule.middleware = [
      (_req, res, next) => {
        expect(typeof (res.blitzCtx.session as SessionContext).create).toBe("function")
        return next()
      },
    ]

    await mockServer(resolverModule, async (url) => {
      // console.log = jest.fn()
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({params: {}}),
      })

      const cookieHeader = res.headers.get("Set-Cookie") as string
      const cookie = (name: string) => readCookie(cookieHeader, name)

      expect(res.status).toBe(200)
      expect(res.headers.get(HEADER_CSRF)).not.toBe(undefined)
      expect(cookie(COOKIE_ANONYMOUS_SESSION_TOKEN)).not.toBeUndefined()
      expect(cookie(COOKIE_SESSION_TOKEN)).toBe("")
      expect(cookie(COOKIE_REFRESH_TOKEN)).toBeUndefined()

      expect(res.headers.get(HEADER_PUBLIC_DATA_TOKEN)).toBe("updated")
      expect(cookie(COOKIE_PUBLIC_DATA_TOKEN)).not.toBe(undefined)

      const [publicDataStr, expireAtStr] = atob(cookie(COOKIE_PUBLIC_DATA_TOKEN)).split(
        TOKEN_SEPARATOR,
      )

      expect(expireAtStr).toBeUndefined()

      const publicData = JSON.parse(publicDataStr)
      expect(publicData.userId).toBe(null)
      expect(publicData.roles.length).toBe(0)
    })
  })

  it.skip("login works", async () => {
    // TODO - fix this test with a mock DB by passing custom config to sessionMiddleware
    const resolverModule = (async (_input: any, ctx: CtxWithSession) => {
      await ctx.session.create({userId: 1, roles: ["admin"]})
      return
    }) as EnhancedResolverModule

    await mockServer(resolverModule, async (url) => {
      console.log = jest.fn()
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({params: {}}),
      })

      expect(res.status).toBe(200)
      expect(res.headers.get(HEADER_CSRF)).not.toBe(undefined)
      expect(res.headers.get(HEADER_PUBLIC_DATA_TOKEN)).not.toBe(undefined)

      const [publicDataStr, expireAtStr] = atob(
        res.headers.get(HEADER_PUBLIC_DATA_TOKEN) as string,
      ).split(TOKEN_SEPARATOR)

      expect(isIsoDate(expireAtStr)).toBeTruthy()

      const publicData = JSON.parse(publicDataStr)
      expect(publicData.userId).toBe(1)
      expect(publicData.roles[0]).toBe("admin")

      const cookieHeader = res.headers.get("Set-Cookie") as string
      expect(readCookie(cookieHeader, COOKIE_SESSION_TOKEN)).not.toBe(undefined)
    })
  })
})

async function mockServer(
  resolverModule: EnhancedResolverModule,
  callback: (url: string) => Promise<void>,
) {
  const dbConnectorFn = undefined

  resolverModule._meta = {
    name: "testResolver",
    type: "query",
    path: "test/path",
    apiUrl: "testurl",
  }

  const handler = rpcApiHandler(
    resolverModule,
    [
      sessionMiddleware({unstable_isAuthorized: unstable_simpleRolesIsAuthorized}),
      ...(resolverModule.middleware || []),
    ],
    dbConnectorFn,
  )

  ;(handler as any).config = {
    api: {
      externalResolver: true,
    },
  }

  let server = http.createServer(async (req, res) => {
    await apiResolver(
      req,
      res,
      null,
      handler,
      {
        previewModeId: "previewModeId",
        previewModeEncryptionKey: "previewModeEncryptionKey",
        previewModeSigningKey: "previewModeSigningKey",
      },
      false,
    )
  })

  try {
    let url = await listen(server)
    await callback(url)
  } finally {
    server.close()
  }
}
