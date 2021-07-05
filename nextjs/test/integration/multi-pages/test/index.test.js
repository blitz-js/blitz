import {
  nextBuild,
  findPort,
  killApp,
  nextStart,
  launchApp,
  renderViaHTTP,
} from 'next-test-utils'
import fs from 'fs-extra'
import webdriver from 'next-webdriver'
import { join } from 'path'

let app
let appPort
const appDir = join(__dirname, '..')
const nextConfig = join(appDir, 'next.config.js')

const specPage = join(appDir, 'app/pages/home.spec.js')
const testPage = join(appDir, 'app/pages/home.test.js')
const specApi = join(appDir, 'app/api/hook.spec.js')
const testApi = join(appDir, 'app/api/hook.test.js')

jest.setTimeout(1000 * 60 * 2)

beforeAll(async () => {
  await fs.copy(specPage, testPage)
  await fs.copy(specApi, testApi)
})
afterAll(async () => {
  await fs.remove(testPage)
  await fs.remove(testApi)
})

const runTests = (mode) => {
  it('should load the pages', async () => {
    const browser = await webdriver(appPort, '/')
    let text = await browser.elementByCss('#page-container').text()
    expect(text).toMatch('Hello World')

    await browser.eval('window.location = "/home"')
    text = await browser.elementByCss('#page-container').text()
    expect(text).toMatch('Home page')

    await browser.eval('window.location = "/pages/new"')
    text = await browser.elementByCss('#page-container').text()
    expect(text).toMatch('Some page')

    await browser.eval('window.location = "/api/hello-api"')
    text = await browser.elementByCss('pre').text()
    expect(text).toMatch('ok')

    await browser.eval('window.location = "/api/api-health"')
    text = await browser.elementByCss('pre').text()
    expect(text).toMatch('ok')

    await browser.eval('window.location = "/api/auth/twitter"')
    text = await browser.elementByCss('pre').text()
    expect(text).toMatch('ok')
  })

  it('should not have test or spec pages', async () => {
    let html = await renderViaHTTP(appPort, '/home.test')
    expect(html).toContain('This page could not be found')

    html = await renderViaHTTP(appPort, '/home.spec')
    expect(html).toContain('This page could not be found')
  })

  if (mode !== 'dev') {
    it('should build routes', async () => {
      const pagesManifest = JSON.parse(
        await fs.readFile(
          join(appDir, `.next/${mode}/pages-manifest.json`),
          'utf8'
        )
      )
      const pages = Object.keys(pagesManifest)
      expect(pages.includes('/home')).toBeTruthy()
      expect(pages.includes('/pages/new')).toBeTruthy()
      expect(pages.includes('/api/api-health')).toBeTruthy()
      expect(pages.includes('/api/v1/api/launch-api')).toBeTruthy()
      expect(
        pages.includes('/api/v1/pages/nested-inside-api-pages')
      ).toBeTruthy()

      expect(pages.includes('/home.test')).toBeFalsy()
      expect(pages.includes('/home.spec')).toBeFalsy()
      expect(pages.includes('/api/hook.spec')).toBeFalsy()
      expect(pages.includes('/api/hook.test')).toBeFalsy()
    })
  }
}

describe('dev mode', () => {
  beforeAll(async () => {
    appPort = await findPort()
    app = await launchApp(appDir, appPort)
  })
  afterAll(() => killApp(app))
  runTests('dev')
})

describe('production mode', () => {
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
    await fs.writeFile(nextConfig, `module.exports = { target: 'serverless' }`)
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
