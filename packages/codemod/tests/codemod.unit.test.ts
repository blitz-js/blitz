import {describe, it, expect, vi, afterAll} from "vitest"
import {replaceBlitzPkgsVersions} from "../src/utils"

describe("replaceBlitzPkgsVersions", () => {
  afterAll(() => {
    vi.clearAllMocks()
  })

  vi.mock("@blitzjs/generator", async () => {
    return {
      fetchDistTags: vi.fn((pkg: string) => {
        if (pkg === "blitz") {
          return {alpha: "1.0.0", beta: "2.0.0", danger: "3.0.0"}
        }
        if (pkg === "zod") {
          return {latest: "1.2.3"}
        }
      }),
    }
  })

  const pkgJson = {
    dependencies: {},
  }

  it("correctly updates versions with the alpha tag", async () => {
    expect(await replaceBlitzPkgsVersions(pkgJson, "alpha")).toEqual({
      dependencies: {
        blitz: "1.0.0",
        "@blitzjs/rpc": "1.0.0",
        "@blitzjs/auth": "1.0.0",
        "@blitzjs/next": "1.0.0",
        next: "12.2.0",
        zod: "1.2.3",
      },
    })
  })

  it("correctly updates versions with the beta tag", async () => {
    expect(await replaceBlitzPkgsVersions(pkgJson, "beta")).toEqual({
      dependencies: {
        blitz: "2.0.0",
        "@blitzjs/rpc": "2.0.0",
        "@blitzjs/auth": "2.0.0",
        "@blitzjs/next": "2.0.0",
        next: "12.2.0",
        zod: "1.2.3",
      },
    })
  })

  it("correctly updates versions with the danger tag", async () => {
    expect(await replaceBlitzPkgsVersions(pkgJson, "danger")).toEqual({
      dependencies: {
        blitz: "3.0.0",
        "@blitzjs/rpc": "3.0.0",
        "@blitzjs/auth": "3.0.0",
        "@blitzjs/next": "3.0.0",
        next: "12.2.0",
        zod: "1.2.3",
      },
    })
  })

  it("sets version as a provided tag if it wasn't found with fetchDistTag function", async () => {
    expect(await replaceBlitzPkgsVersions(pkgJson, "custom")).toEqual({
      dependencies: {
        blitz: "custom",
        "@blitzjs/rpc": "custom",
        "@blitzjs/auth": "custom",
        "@blitzjs/next": "custom",
        next: "12.2.0",
        zod: "1.2.3",
      },
    })
  })

  it("handles package.json without dependecies key", async () => {
    expect(await replaceBlitzPkgsVersions({}, "custom")).toEqual({
      dependencies: {
        blitz: "custom",
        "@blitzjs/rpc": "custom",
        "@blitzjs/auth": "custom",
        "@blitzjs/next": "custom",
        next: "12.2.0",
        zod: "1.2.3",
      },
    })
  })
})
