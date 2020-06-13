/* eslint-disable import/first */
import {multiMock} from './utils/multi-mock'
import {resolve} from 'path'

const mocks = multiMock(
  {
    'next-utils': {
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

describe('Build command', () => {
  const rootFolder = resolve('build')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz')

  beforeEach(async () => {
    mocks.mockFs({
      build: {
        '.now': '',
        one: '',
        two: '',
      },
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
    mocks.mockFs.restore()
  })

  it('should copy the correct files to the build folder', () => {
    expect(directoryTree(rootFolder)).toEqual({
      children: [
        {
          children: [
            {name: 'blitz.config.js'},
            {name: 'last-build'},
            {name: 'next.config.js'},
            {name: 'one'},
            {name: 'two'},
          ],
          name: '.blitz-build',
        },
        {name: '.now'},
        {name: 'one'},
        {name: 'two'},
      ],
      name: 'build',
    })
  })
})
