---
"blitz": minor
"@blitzjs/auth": minor
"@blitzjs/next": minor
"@blitzjs/rpc": minor
"@blitzjs/generator": minor
---

feat: add blitz auth support for the Web `Request` API standard

Usage using the new `withBlitzAuth` adapter in the App Router:

```ts
import {withBlitzAuth} from "app/blitz-server"

export const handler = withBlitzAuth(async (_request, _params, {session}) => {
  await session.$revoke()
  return new Response(
    JSON.stringify({
      userId: session.userId,
    }),
    {status: 200},
  )
})
```

feat: New Blitz RPC handler meant to with the next.js app router `route.ts` files

Usage using the new `rpcAppHandler` function

```ts
// app/api/rpc/[[...blitz]]/route.ts
import {rpcAppHandler} from "@blitzjs/rpc"
import {withBlitzAuth} from "app/blitz-server"

// Usage with blitz auth
export const {GET, POST, HEAD} = withBlitzAuth(rpcAppHandler())

// Standalone usage
export const {GET, POST, HEAD} = rpcAppHandler()
```

chore: Update the app directory starter 
