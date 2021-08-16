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

jest.setTimeout(1000 * 60 * 2)
const appDir = join(__dirname, '../')
const nextConfig = join(appDir, 'next.config.js')
let appPort
let app
let stderr

function runTests(mode) {
  it('global middleware works', async () => {
    const res = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ params: {} }),
    })
    expect(res.headers.get('global-middleware')).toEqual('true')
    // const json = await res.json()
    // expect(json).toEqual({
    //   result: null,
    //   error: { name: 'Error', message: 'error on purpose for test' },
    //   meta: { error: { values: ['Error'] } },
    // })
  })

  it('rpc local middleware works', async () => {
    const res = await fetchViaHTTP(appPort, '/api/rpc/getBasic', null, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ params: {} }),
    })
    expect(res.headers.get('local-middleware')).toEqual('true')
  })

  it('invokeWithMiddleware works', async () => {
    const res = await fetchViaHTTP(appPort, '/api/invoke', null, {
      method: 'GET',
    })
    const text = await res.text()
    expect(text).toEqual('basic-result')
    expect(res.headers.get('global-middleware')).toEqual('true')
    expect(res.headers.get('local-middleware')).toEqual('true')
  })
}

describe('middleware', () => {
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

    runTests('dev')
  })

  describe('server mode', () => {
    beforeAll(async () => {
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests('server')
  })

  describe('serverless mode', () => {
    beforeAll(async () => {
      await fs.writeFile(
        nextConfig,
        `module.exports = { target: 'serverless' }`
      )
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
      await fs.remove(nextConfig)
    })

    runTests('serverless')
  })

  describe('serverless trace mode', () => {
    beforeAll(async () => {
      await fs.writeFile(
        nextConfig,
        `module.exports = { target: 'experimental-serverless-trace' }`
      )
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
      await fs.remove(nextConfig)
    })

    runTests('serverless-trace')
  })
})
