/* eslint-env jest */
import fs from 'fs-extra'
import { join } from 'path'
import {
  killApp,
  findPort,
  launchApp,
  fetchViaHTTP,
  nextBuild,
  nextStart,
} from 'next-test-utils'
import {
  COOKIE_ANONYMOUS_SESSION_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_SESSION_TOKEN,
  HEADER_CSRF,
  HEADER_PUBLIC_DATA_TOKEN,
} from 'next/data-client'
import { fromBase64 } from 'b64-lite'

jest.setTimeout(1000 * 60 * 2)
const appDir = join(__dirname, '../')
const nextConfig = join(appDir, 'next.config.js')
let appPort
let stderr
let mode
let app

function readCookie(cookieHeader, name) {
  const setPos = cookieHeader.search(new RegExp('\\b' + name + '='))
  const stopPos = cookieHeader.indexOf(';', setPos)
  let res
  if (!~setPos) return undefined
  res = decodeURIComponent(
    cookieHeader.substring(setPos, ~stopPos ? stopPos : undefined).split('=')[1]
  )
  return res.charAt(0) === '{' ? JSON.parse(res) : res
}

function runTests(dev = false) {
  describe('anonymous', () => {
    it('sets correct cookies', async () => {
      // Same as in blitz.config.ts
      process.env.__BLITZ_SESSION_COOKIE_PREFIX = 'auth-integration'

      const res = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ params: {} }),
      })

      const cookieHeader = res.headers.get('Set-Cookie')
      const cookie = (name) => readCookie(cookieHeader, name)

      expect(res.status).toBe(200)
      expect(res.headers.get(HEADER_CSRF)).not.toBe(undefined)
      expect(cookie(COOKIE_ANONYMOUS_SESSION_TOKEN())).not.toBeUndefined()
      expect(cookie(COOKIE_SESSION_TOKEN())).toBe('')
      expect(cookie(COOKIE_REFRESH_TOKEN())).toBeUndefined()

      expect(res.headers.get(HEADER_PUBLIC_DATA_TOKEN)).toBe('updated')
      expect(cookie(COOKIE_PUBLIC_DATA_TOKEN())).not.toBe(undefined)

      const publicDataStr = fromBase64(cookie(COOKIE_PUBLIC_DATA_TOKEN()))
      const publicData = JSON.parse(publicDataStr)
      expect(publicData.userId).toBe(null)

      process.env.__BLITZ_SESSION_COOKIE_PREFIX = undefined
    })
  })

  describe('authenticated', () => {
    it('login works', async () => {
      // Same as in blitz.config.ts
      process.env.__BLITZ_SESSION_COOKIE_PREFIX = 'auth-integration'

      const res = await fetchViaHTTP(appPort, '/api/rpc/login', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ params: {} }),
      })

      expect(res.status).toBe(200)
      expect(res.headers.get(HEADER_CSRF)).not.toBe(undefined)

      const cookieHeader = res.headers.get('Set-Cookie')
      const cookie = (name) => readCookie(cookieHeader, name)
      expect(cookieHeader).not.toBe(undefined)

      const publicDataHeader = res.headers.get(HEADER_PUBLIC_DATA_TOKEN)
      expect(publicDataHeader).toBe('updated')

      const publicDataStr = fromBase64(cookie(COOKIE_PUBLIC_DATA_TOKEN()))
      const publicData = JSON.parse(publicDataStr)
      expect(publicData.userId).toBe(1)
      expect(publicData.role).toBe('user')

      expect(readCookie(cookieHeader, COOKIE_SESSION_TOKEN())).not.toBe(
        undefined
      )

      process.env.__BLITZ_SESSION_COOKIE_PREFIX = undefined
    })
  })

  it('accepts a custom domain attribute', async () => {
    const res = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ params: {} }),
    })

    const cookieHeader = res.headers.get('Set-Cookie')
    const cookie = (name) => readCookie(cookieHeader, name)

    expect(res.status).toBe(200)
    // This is set in blitz.config.ts
    expect(cookie('Domain')).toBe('test')
  })

  it('does not require CSRF header on HEAD requests', async () => {
    const res = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ params: {} }),
    })

    const cookieHeader = res.headers.get('Set-Cookie')

    const headRes = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Cookie: cookieHeader,
      },
    })

    expect(headRes.status).toBe(200)
  })
}

describe('Auth', () => {
  describe('dev mode', () => {
    beforeAll(async () => {
      stderr = ''
      appPort = await findPort()
      app = await launchApp(appDir, appPort, {
        onStderr: (msg) => {
          stderr += msg
        },
      })
    })
    afterAll(() => killApp(app))

    runTests(true)
  })

  describe('server mode', () => {
    beforeAll(async () => {
      await nextBuild(appDir)
      mode = 'server'
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })

  describe('serverless mode', () => {
    beforeAll(async () => {
      await fs.writeFile(
        nextConfig,
        `module.exports = { target: 'serverless' }`
      )
      await nextBuild(appDir)
      mode = 'serverless'
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
      await fs.remove(nextConfig)
    })

    runTests()
  })
})
