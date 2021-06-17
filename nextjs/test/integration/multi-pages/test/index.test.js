import {
  nextBuild,
  findPort,
  killApp,
  nextStart,
  launchApp,
} from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

let app
let appPort
const appDir = join(__dirname, '..')

jest.setTimeout(1000 * 60 * 2)

const runTests = () => {
  it('should load the page', async () => {
    const browser = await webdriver(appPort, '/')
    const text = await browser.elementByCss('#page-container').text()
    expect(text).toMatch('Hello World')
  })
}

describe('dev mode', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    appPort = await findPort()
    // buildId = 'development'
    app = await launchApp(appDir, appPort)
  })
  afterAll(() => killApp(app))
  runTests()
})

describe('production mode', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    // buildId = await fs.readFile(join(appDir, '.next/BUILD_ID'), 'utf8')
    appPort = await findPort()
    app = await nextStart(appDir, appPort)
  })
  afterAll(() => killApp(app))
  runTests()
})
