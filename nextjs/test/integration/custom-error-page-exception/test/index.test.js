/* eslint-env jest */

import { join } from 'path'
import webdriver from 'next-webdriver'
import {
  waitFor,
  nextBuild,
  nextStart,
  findPort,
  killApp,
  check,
} from 'next-test-utils'

jest.setTimeout(1000 * 60 * 1)

const appDir = join(__dirname, '..')
let appPort
let app

describe('Custom error page exception', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    appPort = await findPort()
    app = await nextStart(appDir, appPort)
  })
  afterAll(() => killApp(app))
  it('should handle errors from _error render', async () => {
    const navSel = '#nav'
    const browser = await webdriver(appPort, '/')
    await waitFor(100)
    await browser.waitForElementByCss(navSel).elementByCss(navSel).click()
    await waitFor(100)

    await check(
      () => browser.eval('document.documentElement.innerHTML'),
      /Application error: a client-side exception has occurred/
    )
  })
})
