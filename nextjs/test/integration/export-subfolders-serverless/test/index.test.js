/* eslint-env jest */

import { promises } from 'fs'
import { join } from 'path'
import cheerio from 'cheerio'
import { nextBuild, nextExport } from 'next-test-utils'

jest.setTimeout(1000 * 60 * 5)
const { access, readFile } = promises
const appDir = join(__dirname, '../')
const outdir = join(appDir, 'out')

describe('Export config#exportTrailingSlash set to false', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    await nextExport(appDir, { outdir })
  })

  it('should export pages as [filename].html instead of [filename]/index.html', async () => {
    expect.assertions(6)

    await expect(access(join(outdir, 'index.html'))).resolves.toBe(undefined)
    await expect(access(join(outdir, 'about.html'))).resolves.toBe(undefined)
    await expect(access(join(outdir, 'posts.html'))).resolves.toBe(undefined)
    await expect(access(join(outdir, 'posts', 'single.html'))).resolves.toBe(
      undefined
    )

    const html = await readFile(join(outdir, 'index.html'))
    const $ = cheerio.load(html)
    expect($('p').text()).toBe('I am a home page')

    const htmlSingle = await readFile(join(outdir, 'posts', 'single.html'))
    const $single = cheerio.load(htmlSingle)
    expect($single('p').text()).toBe('I am a single post')
  })
})
