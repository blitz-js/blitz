import * as fs from 'fs-extra'
import spawn from 'cross-spawn'

import AppGenerator from '../../src/generators/app'

// Spies process to avoid trying to chdir to a non existing folder
jest.spyOn(process, 'chdir').mockImplementation(() => true)
// Mocks the log output
jest.mock(
  '@blitzjs/server',
  jest.fn(() => {
    return {
      log: {
        success: jest.fn(),
        progress: jest.fn(),
        error: jest.fn(),
        withBranded: jest.fn(),
        spinner: jest.fn().mockImplementation(() => {
          return {
            start: jest.fn().mockImplementation(() => ({succeed: jest.fn()})),
          }
        }),
      },
    }
  }),
)

// Mocks spawn
jest.mock('cross-spawn', () => {
  const spawn = jest.fn().mockImplementation(() => {
    return {
      stdout: {
        setEncoding: jest.fn(),
        on: jest.fn(),
      },
      on: (_: any, callback: any) => callback(),
    }
  })
  // @ts-ignore (TS complains about reassign)
  spawn.sync = jest.fn().mockImplementation(() => {
    return {status: 0}
  })
  return spawn
})

// Mocks fs-extra used by both AppGenerator and Generator base class
jest.mock(
  'fs-extra',
  jest.fn(() => {
    return {
      readJSONSync: jest.fn().mockImplementation(() => ({
        dependencies: {
          react: '^16.8.0',
        },
        devDependencies: {
          debug: '^4.1.1',
        },
      })),
      ensureDir: jest.fn(),
      existsSync: jest.fn(),
      writeJson: jest.fn(),
    }
  }),
)

jest.mock(
  'mem-fs-editor',
  jest.fn(() => {
    return {
      create: jest.fn().mockImplementation(() => {
        return {
          move: jest.fn(),
          commit: (_: any, callback: any) => callback(),
          copy: jest.fn(),
        }
      }),
    }
  }),
)

describe('AppGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const generator = new AppGenerator({
    sourceRoot: '../../templates/app',
    destinationRoot: '/new-app',
    appName: 'new-app',
    dryRun: false,
    useTs: true,
    yarn: true,
    version: '1.0',
    skipInstall: false,
  })

  describe('when creating dependencies', () => {
    it('calls readJSONSync with package json location', async () => {
      const expectedLocation = '/new-app/package.json'
      await generator.run()
      expect(fs.readJSONSync).toHaveBeenCalledWith(expectedLocation)
    })

    it('calls writeJson with package json location and package', async () => {
      const expectedLocation = '/new-app/package.json'
      await generator.run()

      expect(fs.writeJson).toHaveBeenCalledWith(expectedLocation, expect.any(Object), {spaces: 2})
    })
  })

  it('calls git init', async () => {
    await generator.run()

    expect(spawn.sync).toHaveBeenCalledWith('git', ['init'], {stdio: 'ignore'})
  })

  it('calls git add', async () => {
    await generator.run()

    expect(spawn.sync).toHaveBeenCalledWith('git', ['add', '.'], {stdio: 'ignore'})
  })

  it('calls git commit', async () => {
    await generator.run()

    expect(spawn.sync).toHaveBeenCalledWith('git', ['commit', '-m', 'New baby Blitz app!'], {
      stdio: 'ignore',
    })
  })
})
