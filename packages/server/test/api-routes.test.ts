/* eslint-disable import/first */

const nextUtilsMock = {
  nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
  nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
}
// Quieten reporter
jest.doMock('../src/reporter', () => ({
  reporter: {copy: jest.fn(), remove: jest.fn()},
}))

// Assume next works
jest.doMock('../src/next-utils', () => nextUtilsMock)
jest.doMock('../src/resolve-bin-async', () => ({
  resolveBinAsync: jest.fn().mockReturnValue(Promise.resolve('')),
}))

// Import with mocks applied
import {dev} from '../src/dev'
import {directoryTree} from './utils/tree-utils'

import mock from 'mock-fs'

describe('Dev command', () => {
  const rootFolder = '/'
  const buildFolder = '/.blitz-build'
  const devFolder = '/.blitz-rules'

  beforeEach(async () => {
    mock({
      '/app': {
        api: {
          'bar.ts': 'test',
        },
        foo: {
          api: {
            'foo.ts': 'test',
          },
        },
      },
    })
    jest.clearAllMocks()
    await dev({rootFolder, buildFolder, devFolder, writeManifestFile: false, watch: false})
  })

  afterEach(async () => {
    mock.restore()
  })

  it('should copy the correct files to the dev folder', async () => {
    const tree = directoryTree(devFolder)
    expect(tree).toEqual({
      name: '.blitz-rules',
      children: [
        {name: 'blitz.config.js'},
        {name: 'next.config.js'},
        {
          name: 'pages',
          children: [{name: 'api', children: [{name: 'bar.ts'}, {name: 'foo.ts'}]}],
        },
      ],
    })
  })
})
