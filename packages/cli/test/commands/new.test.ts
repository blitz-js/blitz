import {New} from "../../src/commands/new"
import {getLatestVersion} from "@blitzjs/generator/src/utils/get-latest-version"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import fetch from "node-fetch"
import nock from "nock"
import rimraf from "rimraf"
import {stdout} from "stdout-stderr"

jest.setTimeout(120 * 1000)
const blitzCliPackageJson = require("../../package.json")

async function getBlitzDistTags() {
  const response = await fetch("https://registry.npmjs.org/-/package/blitz/dist-tags")
  return await response.json()
}

/* TODO - fix test on CI windows. Getting this error:
 *
 *  TypeError:
 *  JSON Error in D:\a\blitz\blitz\node_modules\@blitzjs\generator\dist\templates\app\package.json:
 *     LinesAndColumns$1 is not a constructor
 *       at parseJson$1 (../../node_modules/prettier/third-party.js:3200:21)
 *       at Object.loadJson (../../node_modules/prettier/third-party.js:11009:22)
 */
const testIfNotWindows = process.platform === "win32" ? test.skip : test

jest.mock("enquirer", () => {
  return jest.fn().mockImplementation(() => {
    return {
      prompt: jest.fn().mockImplementation(() => ({
        form: "React Final Form",
        database: "SQLite",
      })),
    }
  })
})

describe("`new` command", () => {
  describe("when scaffolding new project", () => {
    beforeEach(() => {
      stdout.stripColor = true
      stdout.start()
    })

    afterEach(() => {
      stdout.stop()
    })

    jest.setTimeout(120 * 1000)

    function makeTempDir() {
      const tmpDirPath = path.join(os.tmpdir(), "blitzjs-test-")
      return fs.mkdtempSync(tmpDirPath)
    }

    async function whileStayingInCWD(task: () => PromiseLike<void>) {
      const oldCWD = process.cwd()
      await task()
      process.chdir(oldCWD)
    }

    function getStepsFromOutput() {
      const output = stdout.output
      const exp = /^   \d. (.*)$/gm
      const matches = []
      let match

      while ((match = exp.exec(output)) != null) {
        matches.push(match[1].trim())
      }

      return matches
    }

    async function withNewApp(test: (dirName: string, packageJson: any) => Promise<void> | void) {
      const tempDir = makeTempDir()

      await whileStayingInCWD(() => New.run([tempDir, "--skip-install"]))

      const packageJsonFile = fs.readFileSync(path.join(tempDir, "package.json"), {
        encoding: "utf8",
        flag: "r",
      })
      const packageJson = JSON.parse(packageJsonFile)

      await test(tempDir, packageJson)

      rimraf.sync(tempDir)
    }

    testIfNotWindows(
      "pins Blitz to the current version",
      async () =>
        await withNewApp(async (dirName, packageJson) => {
          const {
            dependencies: {blitz: blitzVersion},
          } = packageJson

          const {latest, canary} = await getBlitzDistTags()
          if (blitzCliPackageJson.version.includes("canary")) {
            expect(blitzVersion).toEqual(canary)
          } else {
            expect(blitzVersion).toEqual(latest)
          }

          expect(getStepsFromOutput()).toStrictEqual([
            `cd ${dirName}`,
            "yarn",
            "blitz db migrate (when asked, you can name the migration anything)",
            "blitz start",
          ])
        }),
    )

    testIfNotWindows("performs all steps on a full install", async () => {
      const tempDir = makeTempDir()
      await whileStayingInCWD(() => New.run([tempDir]))
      rimraf.sync(tempDir)

      expect(getStepsFromOutput()).toStrictEqual([`cd ${tempDir}`, "blitz start"])
    })

    it("fetches latest version from template", async () => {
      const expectedVersion = "3.0.0"
      const templatePackage = {name: "eslint-plugin-react-hooks", version: "3.x"}

      const scope = nock("https://registry.npmjs.org")

      scope
        .get(`/${templatePackage.name}`)
        .reply(200, {versions: {"4.0.0": {}, "3.0.0": {}}})
        .persist()

      scope
        .get(`/-/package/${templatePackage.name}/dist-tags`)
        .reply(200, {
          latest: "4.0.0",
        })
        .persist()

      const {value: latestVersion} = await getLatestVersion(
        templatePackage.name,
        templatePackage.version,
      )
      expect(latestVersion).toBe(expectedVersion)
    })

    describe("with network trouble", () => {
      testIfNotWindows("uses template versions", async () => {
        nock("https://registry.npmjs.org").get(/.*/).reply(500).persist()

        await withNewApp(async (_, packageJson) => {
          const {dependencies} = packageJson
          expect(dependencies.blitz).toBe("latest")
        })

        nock.restore()
      })
    })
  })
})
