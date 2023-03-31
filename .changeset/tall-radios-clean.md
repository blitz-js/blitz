---
"@blitzjs/auth": patch
"@blitzjs/rpc": patch
"blitz": patch
---

feature: Nextjs 13 App Directory Utility Methods

### 🔧 New Blitz Auth Hook `useAuthenticatedBlitzContext`

This hook is implemented as the replacement of the [`BlitzPage` seurity auth utilities](https://blitzjs.com/docs/authorization#secure-your-pages) provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
It can be used in any asynchronous server component be it in `page.ts` or in the layouts in `layout.ts`
It uses the new [`redirect` function](https://beta.nextjs.org/docs/api-reference/redirect) to provide the required authorization in server side

#### API

```ts
useAuthenticatedBlitzContext({
  redirectTo,
  redirectAuthenticatedTo,
  role,
}: {
  redirectTo?: string | RouteUrlObject
  redirectAuthenticatedTo?: string | RouteUrlObject | ((ctx: Ctx) => string | RouteUrlObject)
  role?: string | string[]
}): Promise<void>
```

#### Usage

**Example Usage in React Server Component in `app` directory in Next 13**

```ts
import {getAppSession, useAuthenticatedBlitzContext} from "src/blitz-server"
...
await useAuthenticatedBlitzContext({
    redirectTo: "/auth/login",
    role: ["admin"],
    redirectAuthenticatedTo: "/dashboard",
})
```

### 🔧 New Blitz RPC Hook `invokeResolver`

#### API

```ts
invokeResolver<T extends (...args: any) => any, TInput = FirstParam<T>>(
  queryFn: T,
  params: TInput,
): Promise<PromiseReturnType<T>>
```

#### Example Usage

```ts
...
import {invokeResolver, useAuthenticatedBlitzContext} from "../src/blitz-server"
import getCurrentUser from "../src/users/queries/getCurrentUser"

export default async function Home() {
  await useAuthenticatedBlitzContext({
    redirectTo: "/auth/login",
  })
  const user = await invokeResolver(getCurrentUser, null)
...
```
