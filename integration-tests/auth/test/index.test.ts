import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {
  killApp,
  findPort,
  launchApp,
  nextBuild,
  nextStart,
  runBlitzCommand,
  blitzLaunchApp,
  blitzBuild,
  blitzStart,
} from "../../utils/next-test-utils"
import webdriver from "../../utils/next-webdriver"

import {join} from "path"
import fetch from "node-fetch"
import {fromBase64} from "b64-lite"
import seed from "../db/seed"
import prisma from "../db"

let app: any
let appPort: number
const appDir = join(__dirname, "../")
const HEADER_CSRF = "anti-csrf"
const COOKIE_PUBLIC_DATA_TOKEN = "auth-tests-cookie-prefix_sPublicDataToken"
const COOKIE_SESSION_TOKEN = "auth-tests-cookie-prefix_sSessionToken"
const COOKIE_ANONYMOUS_SESSION_TOKEN = "auth-tests-cookie-prefix_sAnonymousSessionToken"
const COOKIE_REFRESH_TOKEN = "auth-tests-cookie-prefix_sIdRefreshToken"
const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"

function readCookie(cookieHeader, name) {
  const setPos = cookieHeader.search(new RegExp("\\b" + name + "="))
  const stopPos = cookieHeader.indexOf(";", setPos)
  let res
  if (!~setPos) return undefined
  res = decodeURIComponent(
    cookieHeader.substring(setPos, ~stopPos ? stopPos : undefined).split("=")[1],
  )
  return res.charAt(0) === "{" ? JSON.parse(res) : res
}

const runTests = (mode?: string) => {
  describe("Auth", () => {
    describe("unauthenticated", () => {
      it(
        "should render error for protected query",
        async () => {
          const browser = await webdriver(appPort, "/authenticated-page")
          let errorMsg = await browser.elementById(`error`).text()
          expect(errorMsg).toMatch(/Error: You are not authenticated/)
          if (browser) browser.close()
        },
        5000 * 60 * 2,
      )

      it(
        "should render result for open query",
        async () => {
          const res = await fetch(`http://localhost:${appPort}/api/noauth`, {
            method: "GET",
            headers: {"Content-Type": "application/json; charset=utf-8"},
          })
          expect(res.status).toBe(200)
        },
        5000 * 60 * 2,
      )

      it("sets correct cookie", async () => {
        const res = await fetch(`http://localhost:${appPort}/api/noauth`, {
          method: "GET",
          headers: {"Content-Type": "application/json; charset=utf-8"},
        })
        const cookieHeader = res.headers.get("Set-Cookie")
        const cookie = (name) => readCookie(cookieHeader, name)

        expect(res.status).toBe(200)
        expect(res.headers.get(HEADER_CSRF)).not.toBe(undefined)
        expect(cookie(COOKIE_ANONYMOUS_SESSION_TOKEN)).not.toBeUndefined()
        expect(cookie(COOKIE_SESSION_TOKEN)).toBe("")
        expect(cookie(COOKIE_REFRESH_TOKEN)).toBeUndefined()

        expect(res.headers.get(HEADER_PUBLIC_DATA_TOKEN)).toBe("updated")
        expect(cookie(COOKIE_PUBLIC_DATA_TOKEN)).not.toBe(undefined)

        const publicDataStr = fromBase64(cookie(COOKIE_PUBLIC_DATA_TOKEN))
        const publicData = JSON.parse(publicDataStr)
        expect(publicData.userId).toBe(null)
      })
    })

    describe("authenticated", () => {
      it("should login successfully", async () => {
        const res = await fetch(
          `http://localhost:${appPort}/api/signin?email=test@test.com&password=abcd1234`,
          {
            method: "POST",
            headers: {"Content-Type": "application/json; charset=utf-8"},
          },
        )

        expect(res.status).toBe(200)
        expect(res.headers.get(HEADER_CSRF)).not.toBe(undefined)

        const cookieHeader = res.headers.get("Set-Cookie")
        const cookie = (name) => readCookie(cookieHeader, name)
        expect(cookieHeader).not.toBe(undefined)

        const publicDataStr = fromBase64(cookie(COOKIE_PUBLIC_DATA_TOKEN))
        const publicData = JSON.parse(publicDataStr)
        expect(publicData.userId).toBe(1)

        expect(readCookie(cookieHeader, COOKIE_SESSION_TOKEN)).not.toBe(undefined)
      })

      it("does not require CSRF header on HEAD requests", async () => {
        const res = await fetch(`http://localhost:${appPort}/api/noauth`, {
          method: "GET",
          headers: {"Content-Type": "application/json; charset=utf-8"},
        })
        const cookieHeader = res.headers.get("Set-Cookie")

        const headRes = await fetch(`http://localhost:${appPort}/api/noauth`, {
          method: "HEAD",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            cookie: cookieHeader as string,
          },
        })

        expect(headRes.status).toBe(200)
      })
    })
  })
}

describe("Auth Tests", () => {
  describe("dev mode", () => {
    beforeAll(async () => {
      try {
        await runBlitzCommand(["prisma", "migrate", "reset", "--force"])
        appPort = await findPort()
        app = await blitzLaunchApp(appPort, {cwd: process.cwd()})
      } catch (error) {
        console.log(error)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))
    runTests()
  })

  describe("server mode", () => {
    beforeAll(async () => {
      try {
        await runBlitzCommand(["prisma", "generate"])
        await runBlitzCommand(["prisma", "migrate", "deploy"])
        await blitzBuild()
        appPort = await findPort()
        app = await blitzStart(appPort, {cwd: process.cwd()})
      } catch (err) {
        console.log(err)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))

    runTests()
  })
})
