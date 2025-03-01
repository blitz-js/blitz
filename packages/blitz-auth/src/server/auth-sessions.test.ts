import {expect, describe, it, beforeEach} from "vitest"
import {ServerResponse} from "http"
import {Writable} from "stream"
import {append} from "./auth-sessions"

class MockServerResponse extends Writable {
  private headers: Map<string, string | string[]> = new Map()

  getHeader(name: string) {
    return this.headers.get(name)
  }

  setHeader(name: string, value: string | string[]) {
    this.headers.set(name, value)
  }

  getHeaders() {
    return Object.fromEntries(this.headers)
  }

  _write(_chunk: unknown, _encoding: string, callback: (error?: Error | null) => void): void {
    callback()
  }
}

describe("append", () => {
  let res: ServerResponse
  const COOKIE_PREFIX = "auth-tests-cookie-prefix_s"

  beforeEach(() => {
    res = new MockServerResponse() as unknown as ServerResponse
  })

  describe("Blitz Auth Flows", () => {
    const anonymousSessionCookie = `${COOKIE_PREFIX}AnonymousSessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJibGl0empzIjp7ImlzQW5vbnltb3VzIjp0cnVlLCJoYW5kbGUiOiJEVjk4OVZadFpra0lpWHFSOFRPX3Fvem44MHBwWFBnaDphand0IiwicHVibGljRGF0YSI6eyJ1c2VySWQiOm51bGx9LCJhbnRpQ1NSRlRva2VuIjoiM25BdDBZWVI0b0xDNnAtTm1fQW1CeFQxRmJmVmpiaXMifSwiaWF0IjoxNzQwODA0NTE4LCJhdWQiOiJibGl0empzIiwiaXNzIjoiYmxpdHpqcyIsInN1YiI6ImFub255bW91cyJ9.ZpMxWh3Yq2Qe4BXzZ61d4V0YGV2luswF7ovE90DxURM; Path=/; Expires=Thu, 28 Feb 2030 04:48:38 GMT; HttpOnly; SameSite=Lax`
    const antiCsrfCookie = `${COOKIE_PREFIX}AntiCsrfToken=3nAt0YYR4oLC6p-Nm_AmBxT1FbfVjbis; Path=/; Expires=Thu, 28 Feb 2030 04:48:38 GMT; SameSite=Lax`
    const publicDataCookie = `${COOKIE_PREFIX}PublicDataToken=eyJ1c2VySWQiOm51bGx9; Path=/; Expires=Thu, 28 Feb 2030 04:48:38 GMT; SameSite=Lax`

    const expiredSessionCookie = `${COOKIE_PREFIX}SessionToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
    const expiredAnonymousCookie = `${COOKIE_PREFIX}AnonymousSessionToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`

    // Login cookies
    const loginAntiCsrfCookie = `${COOKIE_PREFIX}AntiCsrfToken=1s3yaYs0yThO-DwOuiepJLzycvN090tO; Path=/; Expires=Mon, 31 Mar 2025 04:48:38 GMT; SameSite=Lax`
    const loginPublicDataCookie = `${COOKIE_PREFIX}PublicDataToken=eyJ1c2VySWQiOjEsInJvbGUiOiJ1c2VyIn0%3D; Path=/; Expires=Mon, 31 Mar 2025 04:48:38 GMT; SameSite=Lax`
    const loginSessionCookie = `${COOKIE_PREFIX}SessionToken=aGNjc0o5anJ5eTF4bDdqRE5VN09LeEx5QUJoR2toUjc6b3RzO1NaWC1la3YydGR4UGNjWVp6QkM0SlBQbUdWWmZEMlpFOzhhYWU1MDI2M2Q0YmUyNDIxZWYwNDBmMmFhZGI2MDk4YTNiNjhjMTAyZjlmNmNjYTQ4NzUzMGZiYjc0ZTdhYmI7djA%3D; Path=/; Expires=Mon, 31 Mar 2025 04:48:38 GMT; HttpOnly; SameSite=Lax`

    it("should handle anonymous session cookies", () => {
      append(res, "Set-Cookie", [anonymousSessionCookie, antiCsrfCookie, publicDataCookie])

      const cookies = res.getHeader("Set-Cookie") as string[]
      expect(cookies).toHaveLength(3)
      expect(cookies[0]).toBe(anonymousSessionCookie)
      expect(cookies[1]).toBe(antiCsrfCookie)
      expect(cookies[2]).toBe(publicDataCookie)
    })

    it("should deduplicate cookies when the same one is set twice", () => {
      append(res, "Set-Cookie", anonymousSessionCookie)
      append(res, "Set-Cookie", anonymousSessionCookie)

      const cookies = res.getHeader("Set-Cookie") as string[]
      expect(cookies).toHaveLength(1)
      expect(cookies[0]).toBe(anonymousSessionCookie)
    })

    it("should replace cookies with same name when values change", () => {
      append(res, "Set-Cookie", anonymousSessionCookie)

      const updatedAnonymousCookie = `${COOKIE_PREFIX}AnonymousSessionToken=NEW_TOKEN_VALUE; Path=/; SameSite=Lax`
      append(res, "Set-Cookie", updatedAnonymousCookie)

      const cookies = res.getHeader("Set-Cookie") as string[]
      expect(cookies).toHaveLength(1)
      expect(cookies[0]).toBe(updatedAnonymousCookie)
    })

    it("should handle session expiration", () => {
      // First add anonymous session
      append(res, "Set-Cookie", [anonymousSessionCookie, antiCsrfCookie, publicDataCookie])

      append(res, "Set-Cookie", [expiredSessionCookie, expiredAnonymousCookie])

      const cookies = res.getHeader("Set-Cookie") as string[]
      expect(cookies).toHaveLength(4)

      expect(cookies.find((c) => c === expiredSessionCookie)).toBeDefined()
      expect(cookies.find((c) => c === expiredAnonymousCookie)).toBeDefined()
    })

    it("should handle login flow cookies", () => {
      // First anonymous session
      append(res, "Set-Cookie", [anonymousSessionCookie, antiCsrfCookie, publicDataCookie])

      // Then login, which expires anonymous and sets new session
      append(res, "Set-Cookie", [
        expiredAnonymousCookie,
        loginSessionCookie,
        loginAntiCsrfCookie,
        loginPublicDataCookie,
      ])

      const cookies = res.getHeader("Set-Cookie") as string[]

      // Should have 4 cookies:
      // - Original antiCsrf cookie (should be replaced by login one)
      // - Expired anonymous cookie
      // - Login session cookie
      // - Login publicData cookie
      expect(cookies).toHaveLength(4)

      // Check proper replacement by extracting cookie names
      const cookieNames = cookies.map((c) => {
        const namePart = c.substring(0, c.indexOf("="))
        return namePart
      })

      expect(cookieNames.filter((n) => n === `${COOKIE_PREFIX}AntiCsrfToken`)).toHaveLength(1)
      expect(cookieNames.filter((n) => n === `${COOKIE_PREFIX}PublicDataToken`)).toHaveLength(1)
      expect(cookieNames.filter((n) => n === `${COOKIE_PREFIX}SessionToken`)).toHaveLength(1)
      // the expired cookie
      expect(cookieNames.filter((n) => n === `${COOKIE_PREFIX}AnonymousSessionToken`)).toHaveLength(
        1,
      )
    })

    it("should properly combine multiple append calls with different cookie groups", () => {
      append(res, "Set-Cookie", [anonymousSessionCookie, antiCsrfCookie])

      append(res, "Set-Cookie", [publicDataCookie, loginAntiCsrfCookie])

      const cookies = res.getHeader("Set-Cookie") as string[]

      expect(cookies).toHaveLength(3)

      const antiCsrfCookies = cookies.filter((c) => c.includes(`${COOKIE_PREFIX}AntiCsrfToken`))
      expect(antiCsrfCookies).toHaveLength(1)
      expect(antiCsrfCookies[0]).toBe(loginAntiCsrfCookie)
    })

    it("should handle the full session flow", () => {
      append(res, "Set-Cookie", [anonymousSessionCookie, antiCsrfCookie, publicDataCookie])

      const initialCookies = res.getHeader("Set-Cookie") as string[]
      expect(initialCookies).toHaveLength(3)

      append(res, "Set-Cookie", [
        expiredAnonymousCookie,
        loginSessionCookie,
        loginAntiCsrfCookie,
        loginPublicDataCookie,
      ])
      const loginCookies = res.getHeader("Set-Cookie") as string[]
      expect(loginCookies).toHaveLength(4)

      append(res, "Set-Cookie", [
        expiredSessionCookie,
        anonymousSessionCookie,
        antiCsrfCookie,
        publicDataCookie,
      ])
      const logoutCookies = res.getHeader("Set-Cookie") as string[]
      expect(logoutCookies).toHaveLength(4)

      const cookies = res.getHeader("Set-Cookie") as string[]

      const cookieNames = cookies.map((c) => c.substring(0, c.indexOf("=")))

      // Check we have the right number of each cookie type
      const counts = cookieNames.reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      expect(Object.keys(counts).length).toBe(4)

      Object.values(counts).forEach((count) => {
        expect(count).toBeLessThanOrEqual(3)
      })
    })

    it("should handle cookies with quoted values and special characters", () => {
      const specialCookie = `${COOKIE_PREFIX}PublicDataToken="eyJ1c2VySWQiOjEsIm5hbWUiOiJKb2huIERvZSwgSnIuIn0%3D"; Path=/; SameSite=Lax`
      append(res, "Set-Cookie", specialCookie)

      const cookies = res.getHeader("Set-Cookie") as string[]
      expect(cookies).toHaveLength(1)
      expect(cookies[0]).toBe(specialCookie)
    })
  })
})
