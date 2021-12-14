/* eslint-env jest */

import webdriver from 'next-webdriver'
import { join } from 'path'
import {
  findPort,
  launchApp,
  killApp,
  nextBuild,
  nextStart,
  waitFor,
} from 'next-test-utils'

jest.setTimeout(1000 * 60 * 2)

let app
let appPort
const appDir = join(__dirname, '../')

function runTests() {
  it('should load page correctly', async () => {
    const browser = await webdriver(appPort, '/')

    waitFor(500)

    expect(
      await browser
        .elementByCss('#__next div:nth-child(2)')
        .getComputedCss('background-color')
    ).toContain('221, 221, 221')

    expect(await browser.eval('document.documentElement.innerHTML')).toContain(
      'Where does it come from?'
    )
  })
}

describe('next/dynamic', () => {
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
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })
})
