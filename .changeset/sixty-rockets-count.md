---
"@blitzjs/rpc": patch
"blitz": patch
---

### Now we can configure Blitz RPC in the following way,

In your `[[...blitz]].ts` api file you can see the following settings
```ts
logging?: {
  /**
   * allowList Represents the list of routes for which logging should be enabled
   * If whiteList is defined then only those routes will be logged
   */
  allowList?: string[]
  /**
   * blockList Represents the list of routes for which logging should be disabled
   * If blockList is defined then all routes except those will be logged
   */
  blockList?: string[]
  /**
   * verbose Represents the flag to enable/disable logging
   * If verbose is true then Blitz RPC will log the input and output of each resolver
   */
  verbose?: boolean
  /**
   * disablelevel Represents the flag to enable/disable logging for a particular level
   */
  disablelevel?: "debug" | "info"
}
```
```ts
import { rpcHandler } from "@blitzjs/rpc"
import { api } from "src/blitz-server"

export default api(
  rpcHandler({
    onError: console.log,
    formatError: (error) => {
      error.message = `FormatError handler: ${error.message}`
      return error
    },
   logging: {
...
}
  })
)
```

Example:
```ts
export default api(
  rpcHandler({
    onError: console.log,
    formatError: (error) => {
      error.message = `FormatError handler: ${error.message}`
      return error
    },
    logging: {
      verbose: true,
      blockList: ["getCurrentUser", ...], //just write the resolver name [which is the resolver file name]
    },
  })
)
```

This is enable verbose blitz rpc logging for all resolvers except the resolvers `getCurrentUser` and others mentioned in the `blockList`

