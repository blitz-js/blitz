import NewCmd from '../../src/commands/new'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import fetch from 'node-fetch'
import nock from 'nock'

jest.setTimeout(60 * 1000)
const blitzCliPackageJson = require('../../package.json')

async function getBlitzDistTags() {
  const response = await fetch('https://registry.npmjs.org/-/package/blitz/dist-tags')
  return await response.json()
}

describe('`new` command', () => {
  describe('when scaffolding new project', () => {
    jest.setTimeout(60 * 1000)

    async function whileStayingInCWD(task: () => PromiseLike<void>) {
      const oldCWD = process.cwd()
      await task()
      process.chdir(oldCWD)
    }

    async function withNewApp(test: (dirName: string, packageJson: any) => Promise<void> | void) {
      function makeTempDir() {
        const tmpDirPath = path.join(os.tmpdir(), 'blitzjs-test-')

        return fs.mkdtempSync(tmpDirPath)
      }

      const tempDir = makeTempDir()

      await whileStayingInCWD(() => NewCmd.run([tempDir, '--skip-install']))

      const packageJsonFile = fs.readFileSync(path.join(tempDir, 'package.json'), {
        encoding: 'utf8',
        flag: 'r',
      })
      const packageJson = JSON.parse(packageJsonFile)

      await test(tempDir, packageJson)

      fs.rmdirSync(tempDir, {recursive: true})
    }

    it('pins Blitz to the current version', async () =>
      await withNewApp(async (_, packageJson) => {
        const {
          dependencies: {blitz: blitzVersion},
        } = packageJson

        const {latest, canary} = await getBlitzDistTags()
        if (blitzCliPackageJson.version.includes('canary')) {
          expect(blitzVersion).toEqual(canary)
        } else {
          expect(blitzVersion).toEqual(latest)
        }
      }))

    describe('with network trouble', () => {
      it('uses template versions', async () => {
        nock('https://registry.npmjs.org').get(/.*/).reply(500).persist()

        await withNewApp(async (_, packageJson) => {
          const {dependencies} = packageJson
          expect(dependencies.blitz).toBe('latest')
        })

        nock.restore()
      })
    })
  })
})
