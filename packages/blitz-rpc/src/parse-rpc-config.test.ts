import {describe, expect, it} from "vitest"
import {getResolverConfig} from "./parse-rpc-config"

describe("getResolverConfig", () => {
  it("base case: no configuration", async () => {
    const result = getResolverConfig("")
    expect(result).toHaveProperty("httpMethod", "POST")
  })

  it("customized to get", async () => {
    const result = getResolverConfig(`
      export const config = {
        httpMethod: 'GET'
      }
    `)
    expect(result).toHaveProperty("httpMethod", "GET")
  })

  it("evaluation is hermetic", async () => {
    expect(
      getResolverConfig(`
      export const config = {
        httpMethod: 'GET'
      }
    `),
    ).toHaveProperty("httpMethod", "GET")

    expect(getResolverConfig(``)).toHaveProperty("httpMethod", "POST")
  })
})
