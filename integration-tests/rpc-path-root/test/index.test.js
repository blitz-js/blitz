import {describe, it, expect, beforeAll, afterAll} from "vitest"
import fs from "fs-extra"
import {join} from "path"
import {
  killApp,
  findPort,
  launchApp,
  fetchViaHTTP,
  nextBuild,
  nextStart,
} from "../../utils/next-test-utils"

// jest.setTimeout(1000 * 60 * 2)
const appDir = join(__dirname, "../")
let appPort
let mode
let app

function runTests(dev = false) {
  describe("api requests", () => {
    it(
      "regular query works",
      async () => {
        const data = await fetchViaHTTP(appPort, "/api/rpc/app/queries/getBasic", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({params: {}}),
        }).then((res) => res.ok && res.json())

        expect(data).toEqual({result: "basic-result", error: null, meta: {}})
      },
      5000 * 60 * 2,
    )

    it(
      "nested query works",
      async () => {
        const data = await fetchViaHTTP(appPort, "/api/rpc/app/queries/v2/getBasic", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({params: {}}),
        }).then((res) => res.ok && res.json())

        expect(data).toEqual({result: "nested-basic", error: null, meta: {}})
      },
      5000 * 60 * 2,
    )

    it(
      "monorepo query works",
      async () => {
        const data = await fetchViaHTTP(appPort, "/api/rpc/queries/getNoSuspenseBasic", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({params: {}}),
        }).then((res) => res.ok && res.json())

        expect(data).toEqual({result: "basic-result", error: null, meta: {}})
      },
      5000 * 60 * 2,
    )
  })
}

describe("RPC", () => {
  describe(
    "dev mode",
    () => {
      beforeAll(async () => {
        try {
          appPort = await findPort()
          app = await launchApp(appDir, appPort, {cwd: process.cwd()})
        } catch (err) {
          console.log(err)
        }
      })
      afterAll(() => killApp(app))

      runTests(true)
    },
    5000 * 60 * 2,
  )

  describe(
    "server mode",
    () => {
      beforeAll(async () => {
        await nextBuild(appDir)
        mode = "server"
        appPort = await findPort()
        app = await nextStart(appDir, appPort, {cwd: process.cwd()})
      })
      afterAll(() => killApp(app))

      runTests()
    },
    5000 * 60 * 2,
  )

  describe(
    "serverless mode",
    () => {
      let nextConfigContent = ""
      const nextConfigPath = join(appDir, "next.config.js")
      beforeAll(async () => {
        nextConfigContent = await fs.readFile(nextConfigPath, "utf8")
        await fs.writeFile(
          nextConfigPath,
          nextConfigContent.replace("// update me", `target: 'experimental-serverless-trace',`),
        )
        await nextBuild(appDir)
        mode = "serverless"
        appPort = await findPort()
        app = await nextStart(appDir, appPort, {cwd: process.cwd()})
      })
      afterAll(async () => {
        await killApp(app)
        await fs.writeFile(nextConfigPath, nextConfigContent)
      })

      runTests()
    },
    5000 * 60 * 2,
  )
})
