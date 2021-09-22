/* eslint-env jest */

import { join } from 'path'
import { nextBuild } from 'next-test-utils'

jest.setTimeout(1000 * 60 * 2)
const appDir = join(__dirname, '..')

describe('Legacy Prerender', () => {
  describe('handles old getStaticParams', () => {
    it('should fail the build', async () => {
      const out = await nextBuild(appDir, [], { stderr: true })
      expect(out.stderr).toMatch(`Build error occurred`)
      expect(out.stderr).toMatch('Additional keys were returned from')
      expect(out.stderr).toMatch('return { params: { foo: ..., post: ... } }')
      expect(out.stderr).toMatch('Keys that need to be moved: foo, baz.')
    })
  })
})
