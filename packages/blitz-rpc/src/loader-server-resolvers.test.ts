import {describe, expect, it} from "vitest"
import {transformBlitzRpcResolverServer} from "./loader-server-resolvers"

const META_TAGS_AND_EXPORT = `
__internal_rpcHandler._resolverName = 'test'
__internal_rpcHandler._resolverType = 'query'
__internal_rpcHandler._routePath = '/api/rpc/test'

export default __internal_rpcHandler
`.trim()

describe("transformBlitzRpcResolverServer", () => {
  it("should compile for function", async () => {
    const result = await transformBlitzRpcResolverServer(
      "export default function test() { return 'test' }",
      "queries/test.js",
      "/",
    )

    expect(result).toBe(
      `const __internal_rpcHandler = function test() { return 'test' }\n\n${META_TAGS_AND_EXPORT}`,
    )
  })

  it("should compile with resolver", async () => {
    const result = await transformBlitzRpcResolverServer(
      `const test = resolver.pipe(() => Promise.resolve('test'))
export default test`,
      "queries/test.js",
      "/",
    )

    expect(result).toBe(
      `const test = resolver.pipe(() => Promise.resolve('test'))
const __internal_rpcHandler = test\n\n${META_TAGS_AND_EXPORT}`,
    )
  })

  it("should compile for plain lambda", async () => {
    const result = await transformBlitzRpcResolverServer(
      "export default () => Promise.resolve('test')",
      "queries/test.js",
      "/",
    )

    expect(result).toBe(
      `const __internal_rpcHandler = () => Promise.resolve('test')\n\n${META_TAGS_AND_EXPORT}`,
    )
  })
})
