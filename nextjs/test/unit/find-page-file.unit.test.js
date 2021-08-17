/* eslint-env jest */
import { findPageFile } from 'next/dist/server/lib/find-page-file'
import { normalizePagePath } from 'next/dist/server/normalize-page-path'

import { join } from 'path'

const resolveDataDir = join(__dirname, '..', 'isolated', '_resolvedata')
const dirWithPages = join(resolveDataDir, 'readdir')

describe('findPageFile', () => {
  it('should work', async () => {
    const pagePath = normalizePagePath('/nav/about')
    const result = await findPageFile(dirWithPages, pagePath, ['jsx', 'js'])
    expect(result).toMatch(/^[\\/]pages[\\/]nav[\\/]about\.js/)
  })

  it('should work with nested index.js', async () => {
    const pagePath = normalizePagePath('/nested')
    const result = await findPageFile(dirWithPages, pagePath, ['jsx', 'js'])
    expect(result).toMatch(/^[\\/]pages[\\/]nested[\\/]index\.js/)
  })

  it('should prefer prefered.js before preferred/index.js', async () => {
    const pagePath = normalizePagePath('/prefered')
    const result = await findPageFile(dirWithPages, pagePath, ['jsx', 'js'])
    expect(result).toMatch(/^[\\/]pages[\\/]prefered\.js/)
  })
})
