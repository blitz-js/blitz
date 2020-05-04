import {New} from '../../src/commands/new'
import {getLatestVersion} from '@blitzjs/generator/src/utils/get-latest-version'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import fetch from 'node-fetch'
import nock from 'nock'

jest.setTimeout(120 * 1000)
const blitzCliPackageJson = require('../../package.json')

async function getBlitzDistTags() {
  const response = await fetch('https://registry.npmjs.org/-/package/blitz/dist-tags')
  return await response.json()
}

describe('`new` command', () => {
  describe('when scaffolding new project', () => {
    jest.setTimeout(120 * 1000)

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

      await whileStayingInCWD(() => New.run([tempDir, '--skip-install']))

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

    it('fetches latest version from template', async () => {
      const expectedVersion = '3.0.0'
      const templatePackage = {name: 'eslint-plugin-react-hooks', version: '3.x'}

      const scope = nock('https://registry.npmjs.org')

      scope
        .get(`/${templatePackage.name}`)
        .reply(200, {versions: {'4.0.0': {}, '3.0.0': {}}})
        .persist()

      scope
        .get(`/-/package/${templatePackage.name}/dist-tags`)
        .reply(200, {
          latest: '4.0.0',
        })
        .persist()

      const {value: latestVersion} = await getLatestVersion(templatePackage.name, templatePackage.version)
      expect(latestVersion).toBe(expectedVersion)
    })

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
