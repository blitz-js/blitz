import {afterAll, beforeAll, describe, expect, it} from "vitest"
import {join} from "path"
import {
  fetchViaHTTP,
  findPort,
  killApp,
  launchApp,
  nextBuild,
  nextExport,
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
      "returns 200 for HEAD",
      async () => {
        const res = await fetchViaHTTP(appPort, "/api/rpc/getBasic", null, {
          method: "HEAD",
        })
        expect(res.status).toEqual(200)
      },
      5000 * 60 * 2,
    )

    it(
      "requires params",
      async () => {
        const res = await fetchViaHTTP(appPort, "/api/rpc/getBasic", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
        })
        const json = await res.json()
        expect(res.status).toEqual(400)
        expect(json.error.message).toBe("Request body is missing the `params` key")
      },
      5000 * 60 * 2,
    )

    it(
      "GET - returns 200 only when enabled",
      async () => {
        const res = await fetchViaHTTP(
          appPort,
          "/api/rpc/getBasicWithGET?params=%7B%7D&meta=%7B%7D",
          null,
          {
            method: "GET",
          },
        )
        expect(res.status).toEqual(200)
      },
      5000 * 60 * 2,
    )

    it(
      "GET - returns 404 otherwise",
      async () => {
        const res = await fetchViaHTTP(
          appPort,
          "/api/rpc/getBasic?params=%7B%7D&meta=%7B%7D",
          null,
          {
            method: "GET",
          },
        )
        expect(res.status).toEqual(404)
      },
      5000 * 60 * 2,
    )

    it(
      "query works - GET",
      async () => {
        const res = await fetchViaHTTP(
          appPort,
          "/api/rpc/getBasicWithGET?params=%7B%7D&meta=%7B%7D",
          null,
          {
            method: "GET",
          },
        )
        const json = await res.json()
        expect(json).toEqual({result: "basic-result", error: null, meta: {}})
        expect(res.status).toEqual(200)
      },
      5000 * 60 * 2,
    )

    it(
      "query works",
      async () => {
        const data = await fetchViaHTTP(appPort, "/api/rpc/getBasic", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({params: {}}),
        }).then((res) => res.ok && res.json())

        expect(data).toEqual({result: "basic-result", error: null, meta: {}})
      },
      5000 * 60 * 2,
    )

    it(
      "mutation works",
      async () => {
        const data = await fetchViaHTTP(appPort, "/api/rpc/setBasic", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({params: "new-basic"}),
        }).then((res) => res.ok && res.json())

        expect(data).toEqual({result: "new-basic", error: null, meta: {}})

        const data2 = await fetchViaHTTP(appPort, "/api/rpc/getBasic", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({params: {}}),
        }).then((res) => res.ok && res.json())

        expect(data2).toEqual({result: "new-basic", error: null, meta: {}})
      },
      5000 * 60 * 2,
    )

    it(
      "handles resolver errors",
      async () => {
        const res = await fetchViaHTTP(appPort, "/api/rpc/getFailure", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({params: {}}),
        })
        const json = await res.json()
        expect(res.status).toEqual(200)
        expect(json).toEqual({
          result: null,
          error: {name: "Error", message: "error on purpose for test", statusCode: 500},
          meta: {error: {values: ["Error"]}},
        })
      },
      5000 * 60 * 2,
    )

    it(
      "nested query works",
      async () => {
        const data = await fetchViaHTTP(appPort, "/api/rpc/v2/getNestedBasic", null, {
          method: "POST",
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({params: {}}),
        }).then((res) => res.ok && res.json())

        expect(data).toEqual({result: "nested-basic", error: null, meta: {}})
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
})
