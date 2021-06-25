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
  nextExport,
  getPageFileFromBuildManifest,
  getPageFileFromPagesManifest,
} from 'next-test-utils'

jest.setTimeout(1000 * 60 * 2)
const appDir = join(__dirname, '../')
const nextConfig = join(appDir, 'next.config.js')
let appPort
let stderr
let mode
let app

function runTests(dev = false) {
  describe('api requests', () => {
    it('returns 200 for HEAD', async () => {
      const res = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
        method: 'HEAD',
      })
      expect(res.status).toEqual(200)
    })

    it('returns 404 for GET', async () => {
      const res = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
        method: 'GET',
      })
      expect(res.status).toEqual(404)
    })

    it('requires params', async () => {
      const res = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
      const json = await res.json()
      expect(res.status).toEqual(400)
      expect(json.error.message).toBe(
        'Request body is missing the `params` key'
      )
    })

    it('query works', async () => {
      const data = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ params: {} }),
      }).then((res) => res.ok && res.json())

      expect(data).toEqual({ result: 'basic-result', error: null, meta: {} })
    })

    it('mutation works', async () => {
      const data = await fetchViaHTTP(appPort, '/api/rpc/setBasic', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ params: 'new-basic' }),
      }).then((res) => res.ok && res.json())

      expect(data).toEqual({ result: 'new-basic', error: null, meta: {} })

      const data2 = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ params: {} }),
      }).then((res) => res.ok && res.json())

      expect(data2).toEqual({ result: 'new-basic', error: null, meta: {} })
    })

    it('handles resolver errors', async () => {
      const res = await fetchViaHTTP(appPort, '/api/rpc/getFailure', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ params: {} }),
      })
      const json = await res.json()
      expect(res.status).toEqual(200)
      expect(json).toEqual({
        result: null,
        error: { name: 'Error', message: 'error on purpose for test' },
        meta: { error: { values: ['Error'] } },
      })
    })

    it('nested query works', async () => {
      const data = await fetchViaHTTP(
        appPort,
        '/api/rpc/v2/getNestedBasic',
        null,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ params: {} }),
        }
      ).then((res) => res.ok && res.json())

      expect(data).toEqual({ result: 'nested-basic', error: null, meta: {} })
    })

    // TODO - test exported config like bodyParser
  })

  if (dev) {
    it('should compile only server code in development', async () => {
      await fetchViaHTTP(appPort, '/api/rpc/getBasic')

      expect(() =>
        getPageFileFromBuildManifest(appDir, '/api/rpc/getBasic')
      ).toThrow(/No files for page/)

      expect(
        getPageFileFromPagesManifest(appDir, '/api/rpc/getBasic')
      ).toBeTruthy()
    })
  } else {
    it('should show warning with next export', async () => {
      const { stderr } = await nextExport(
        appDir,
        { outdir: join(appDir, 'out') },
        { stderr: true }
      )
      expect(stderr).toContain(
        'https://nextjs.org/docs/messages/api-routes-static-export'
      )
    })

    it('should build api routes', async () => {
      const pagesManifest = JSON.parse(
        await fs.readFile(
          join(appDir, `.next/${mode}/pages-manifest.json`),
          'utf8'
        )
      )
      expect(pagesManifest['/api/rpc/getBasic']).toBe(
        'pages/api/rpc/getBasic.js'
      )
    })
  }
}

describe('RPC', () => {
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
