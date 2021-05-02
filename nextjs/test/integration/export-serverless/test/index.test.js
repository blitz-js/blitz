/* eslint-env jest */

import { join } from 'path'
import { promises } from 'fs'
import {
  nextBuild,
  nextExport,
  startStaticServer,
  launchApp,
  stopApp,
  killApp,
  findPort,
  renderViaHTTP,
  File,
} from 'next-test-utils'

import ssr from './ssr'
import browser from './browser'
import dev from './dev'
import dynamic from './dynamic'
import apiRoutes from './api-routes'

jest.setTimeout(1000 * 60 * 5)

const { access, mkdir, writeFile } = promises
const appDir = join(__dirname, '../')
const context = {}
context.appDir = appDir
const devContext = {}
const nextConfig = new File(join(appDir, 'next.config.js'))

describe('Static Export', () => {
  it('should delete existing exported files', async () => {
    const outdir = join(appDir, 'out')
    const tempfile = join(outdir, 'temp.txt')

    await mkdir(outdir).catch((e) => {
      if (e.code !== 'EEXIST') throw e
    })
    await writeFile(tempfile, 'Hello there')

    await nextBuild(appDir)
    await nextExport(appDir, { outdir })

    let doesNotExist = false
    await access(tempfile).catch((e) => {
      if (e.code === 'ENOENT') doesNotExist = true
    })
    expect(doesNotExist).toBe(true)
  })
  beforeAll(async () => {
    const outdir = join(appDir, 'out')
    const outNoTrailSlash = join(appDir, 'outNoTrailSlash')

    await nextBuild(appDir)
    await nextExport(appDir, { outdir })

    nextConfig.replace(
      `exportTrailingSlash: true`,
      `exportTrailingSlash: false`
    )
    await nextBuild(appDir)
    await nextExport(appDir, { outdir: outNoTrailSlash })
    nextConfig.restore()

    context.server = await startStaticServer(outdir)
    context.port = context.server.address().port

    context.serverNoTrailSlash = await startStaticServer(outNoTrailSlash)
    context.portNoTrailSlash = context.serverNoTrailSlash.address().port

    devContext.port = await findPort()
    devContext.server = await launchApp(
      join(__dirname, '../'),
      devContext.port,
      true
    )

    // pre-build all pages at the start
    await Promise.all([
      renderViaHTTP(devContext.port, '/'),
      renderViaHTTP(devContext.port, '/dynamic/one'),
    ])
  })
  afterAll(async () => {
    await Promise.all([
      stopApp(context.server),
      killApp(devContext.server),
      stopApp(context.serverNoTrailSlash),
    ])
  })

  ssr(context)
  browser(context)
  dev(devContext)
  dynamic(context)
  apiRoutes(context)
})
