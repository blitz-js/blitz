/* eslint-env jest */

import url from 'url'
import fs from 'fs-extra'
import { join } from 'path'
import cheerio from 'cheerio'
import {
  nextBuild,
  nextStart,
  renderViaHTTP,
  findPort,
  launchApp,
  killApp,
  fetchViaHTTP,
} from 'next-test-utils'

jest.setTimeout(1000 * 60 * 2)

let app
let appPort
const appDir = join(__dirname, '../app')

const getEnvFromHtml = async (path) => {
  const html = await renderViaHTTP(appPort, path)
  const $ = cheerio.load(html)
  const env = JSON.parse($('p').text())
  env.nextConfigEnv = $('#nextConfigEnv').text()
  env.nextConfigPublicEnv = $('#nextConfigPublicEnv').text()
  return env
}

const runTests = (mode = 'dev', appEnv) => {
  const checkEnvData = (data) => {
    expect(data.ENV_FILE_KEY).toBe('env')
    expect(data.PRODUCTION_ENV_FILE_KEY).toBe(undefined)
    expect(data.ENV_FILE_DEVELOPMENT_OVERRIDE_TEST).toEqual('staginglocal')

    expect(data.nextConfigEnv).toBe('hello from staging app')
    expect(data.nextConfigPublicEnv).toBe('hello again from staging app')
  }

  it('should pass staging env to next.config.js', async () => {
    const res = await fetchViaHTTP(appPort, '/hello', undefined, {
      redirect: 'manual',
    })
    const { pathname } = url.parse(res.headers.get('location'))

    expect(res.status).toBe(307)
    expect(pathname).toBe('/staging-route')
  })

  it('should provide env for SSG', async () => {
    const data = await getEnvFromHtml('/some-ssg')
    checkEnvData(data)
  })

  it('should provide env correctly for SSR', async () => {
    const data = await getEnvFromHtml('/some-ssp')
    checkEnvData(data)
  })

  it('should provide env correctly for API routes', async () => {
    const data = JSON.parse(await renderViaHTTP(appPort, '/api/all'))
    checkEnvData(data)
  })

  it('should load env from .env', async () => {
    const data = await getEnvFromHtml('/')
    expect(data.ENV_FILE_KEY).toEqual('env')
  })
}

describe('Env Config', () => {
  describe('dev mode', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort, {
        env: {
          APP_ENV: 'staging',
        },
      })
    })
    afterAll(() => killApp(app))

    runTests('dev', 'staging')
  })

  describe('server mode', () => {
    beforeAll(async () => {
      const { code } = await nextBuild(appDir, [], {
        env: {
          APP_ENV: 'staging',
        },
      })
      if (code !== 0) throw new Error(`Build failed with exit code ${code}`)

      appPort = await findPort()
      app = await nextStart(appDir, appPort, {
        env: {
          APP_ENV: 'staging',
        },
      })
    })
    afterAll(() => killApp(app))

    runTests('server', 'staging')
  })

  describe('serverless mode', () => {
    let nextConfigContent = ''
    const nextConfigPath = join(appDir, 'next.config.js')
    const envFiles = [
      '.env',
      '.env.staging',
      '.env.staging.local',
      '.env.production',
    ].map((file) => join(appDir, file))

    beforeAll(async () => {
      nextConfigContent = await fs.readFile(nextConfigPath, 'utf8')
      await fs.writeFile(
        nextConfigPath,
        nextConfigContent.replace(
          '// update me',
          `target: 'experimental-serverless-trace',`
        )
      )
      const { code } = await nextBuild(appDir, [], {
        env: {
          APP_ENV: 'staging',
        },
      })

      if (code !== 0) throw new Error(`Build failed with exit code ${code}`)
      appPort = await findPort()

      // rename the files so they aren't loaded by `next start`
      // to test that they were bundled into the serverless files
      for (const file of envFiles) {
        await fs.rename(file, `${file}.bak`)
      }

      app = await nextStart(appDir, appPort, {
        env: {
          APP_ENV: 'staging',
        },
      })
    })
    afterAll(async () => {
      for (const file of envFiles) {
        await fs.rename(`${file}.bak`, file)
      }
      await fs.writeFile(nextConfigPath, nextConfigContent)
      await killApp(app)
    })

    runTests('serverless', 'staging')
  })
})
