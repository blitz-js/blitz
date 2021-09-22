/* eslint-env jest */

import { join } from 'path'
import fs from 'fs-extra'
import {
  renderViaHTTP,
  findPort,
  launchApp,
  killApp,
  nextBuild,
  nextStart,
} from 'next-test-utils'

jest.setTimeout(1000 * 60 * 2)

let app
let appPort
const appDir = join(__dirname, '../')

function runTests() {
  describe('first-line hashbang (#!) parse', () => {
    it('should work for .js files', async () => {
      const html = await renderViaHTTP(appPort, '/')
      expect(html).toMatch('JS: 123')
    })

    it('should work for .mjs files', async () => {
      const html = await renderViaHTTP(appPort, '/')
      expect(html).toMatch('MJS: 456')
    })

    it('should work for .cjs files', async () => {
      const html = await renderViaHTTP(appPort, '/')
      expect(html).toMatch('CJS: 789')
    })
  })
}

const nextConfig = join(appDir, 'next.config.js')

describe('Hashbang', () => {
  describe('dev mode', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests(true)
  })

  describe('production mode', () => {
    beforeAll(async () => {
      await fs.remove(nextConfig)
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })
})
