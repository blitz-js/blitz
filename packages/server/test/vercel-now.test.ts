/* eslint-disable import/first */

import {multiMock} from './utils/multi-mock'
import {resolve} from 'path'
const mocks = multiMock(
  {
    'next-utils': {
      nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
      nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
    },
    'resolve-bin-async': {
      resolveBinAsync: jest.fn().mockReturnValue(Promise.resolve('')),
    },
  },
  resolve(__dirname, '../src'),
)

// Import with mocks applied
import {build} from '../src/build'
import {directoryTree} from './utils/tree-utils'

describe('Build command Vercel', () => {
  const rootFolder = resolve('')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz-dev')

  beforeEach(async () => {
    process.env.NOW_BUILDER = '1'
    mocks.mockFs({
      'app/posts/pages/foo.tsx': '',
      'pages/bar.tsx': '',
      'next.config.js': 'module.exports = {target: "experimental-serverless-trace"}',
    })
    jest.clearAllMocks()
    await build({
      rootFolder,
      buildFolder,
      devFolder,
      writeManifestFile: false,
      port: 3000,
      hostname: 'localhost',
    })
  })

  afterEach(() => {
    delete process.env.NOW_BUILDER
    mocks.mockFs.restore()
  })

  it('should copy the correct files to the build folder', async () => {
    expect(directoryTree(buildFolder)).toEqual({
      name: '.blitz-build',
      children: [
        {name: 'blitz.config.js'},
        {name: 'last-build'},
        {name: 'next-vercel.config.js'},
        {name: 'next.config.js'},
        {
          name: 'pages',
          children: [{name: 'bar.tsx'}, {name: 'foo.tsx'}],
        },
      ],
    })
  })
})
