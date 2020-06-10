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
import {dev} from '../src/dev'
import {directoryTree} from './utils/tree-utils'
describe('Dev command', () => {
  const rootFolder = resolve('')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz-stages')

  beforeEach(async () => {
    mocks.mockFs({
      app: {
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
    await dev({
      rootFolder,
      buildFolder,
      devFolder,
      writeManifestFile: false,
      watch: false,
      port: 3000,
      hostname: 'localhost',
    })
  })

  afterEach(() => {
    mocks.mockFs.restore()
  })

  it('should copy the correct files to the dev folder', () => {
    expect(directoryTree(devFolder)).toEqual({
      name: '.blitz-stages',
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
