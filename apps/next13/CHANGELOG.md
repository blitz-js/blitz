# next-blitz-auth

## 0.1.1-beta.10

### Patch Changes

- Updated dependencies [30fd61316]
- Updated dependencies [3ddb57072]
- Updated dependencies [fe8c937d2]
  - blitz@2.0.0-beta.34
  - @blitzjs/auth@2.0.0-beta.34
  - @blitzjs/next@2.0.0-beta.34
  - @blitzjs/rpc@2.0.0-beta.34
  - @blitzjs/config@2.0.0-beta.34

## 0.1.1-beta.9

### Patch Changes

- Updated dependencies [19898a488]
- Updated dependencies [6811eab1a]
- Updated dependencies [022392c12]
  - @blitzjs/rpc@2.0.0-beta.33
  - blitz@2.0.0-beta.33
  - @blitzjs/next@2.0.0-beta.33
  - @blitzjs/auth@2.0.0-beta.33
  - @blitzjs/config@2.0.0-beta.33

## 0.1.1-beta.8

### Patch Changes

- Updated dependencies [82649f341]
- Updated dependencies [8b01175b4]
  - blitz@2.0.0-beta.32
  - @blitzjs/next@2.0.0-beta.32
  - @blitzjs/auth@2.0.0-beta.32
  - @blitzjs/rpc@2.0.0-beta.32
  - @blitzjs/config@2.0.0-beta.32

## 0.1.1-beta.7

### Patch Changes

- Updated dependencies [90f1741da]
- Updated dependencies [df3265b85]
  - @blitzjs/auth@2.0.0-beta.31
  - blitz@2.0.0-beta.31
  - @blitzjs/rpc@2.0.0-beta.31
  - @blitzjs/next@2.0.0-beta.31
  - @blitzjs/config@2.0.0-beta.31

## 0.1.1-beta.6

### Patch Changes

- Updated dependencies [c5572bec6]
- Updated dependencies [727734955]
  - @blitzjs/auth@2.0.0-beta.30
  - blitz@2.0.0-beta.30
  - @blitzjs/rpc@2.0.0-beta.30
  - @blitzjs/next@2.0.0-beta.30
  - @blitzjs/config@2.0.0-beta.30

## 0.1.1-beta.5

### Patch Changes

- Updated dependencies [b6b9a1c5a]
- Updated dependencies [61888d1a3]
  - @blitzjs/auth@2.0.0-beta.29
  - blitz@2.0.0-beta.29
  - @blitzjs/rpc@2.0.0-beta.29
  - @blitzjs/next@2.0.0-beta.29
  - @blitzjs/config@2.0.0-beta.29

## 0.1.1-beta.4

### Patch Changes

- Updated dependencies [5166e5e03]
- Updated dependencies [2533caf48]
- Updated dependencies [c7ac86b85]
- Updated dependencies [1bb3a6556]
  - @blitzjs/auth@2.0.0-beta.28
  - @blitzjs/next@2.0.0-beta.28
  - @blitzjs/rpc@2.0.0-beta.28
  - blitz@2.0.0-beta.28
  - @blitzjs/config@2.0.0-beta.28

## 0.1.1-beta.3

### Patch Changes

- Updated dependencies [eda14fa8a]
- Updated dependencies [3d004dc41]
- Updated dependencies [29c2b029a]
  - @blitzjs/next@2.0.0-beta.27
  - @blitzjs/rpc@2.0.0-beta.27
  - @blitzjs/auth@2.0.0-beta.27
  - blitz@2.0.0-beta.27
  - @blitzjs/config@2.0.0-beta.27

## 0.1.1-beta.2

### Patch Changes

- Updated dependencies [e82a79be5]
- Updated dependencies [38d945a3f]
  - @blitzjs/auth@2.0.0-beta.26
  - @blitzjs/next@2.0.0-beta.26
  - @blitzjs/rpc@2.0.0-beta.26
  - blitz@2.0.0-beta.26
  - @blitzjs/config@2.0.0-beta.26

## 0.1.1-beta.1

### Patch Changes

- Updated dependencies [f84d77a42]
  - @blitzjs/rpc@2.0.0-beta.25
  - @blitzjs/next@2.0.0-beta.25
  - @blitzjs/auth@2.0.0-beta.25
  - @blitzjs/config@2.0.0-beta.25
  - blitz@2.0.0-beta.25

## 0.1.1-beta.0

### Patch Changes

- 37aeaa7fa: feature: Nextjs 13 App Directory Utility Methods

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

- Updated dependencies [cadefb88e]
- Updated dependencies [6f18cbdc9]
- Updated dependencies [acc07ce94]
- Updated dependencies [ea7561b8e]
- Updated dependencies [9529dbd6f]
- Updated dependencies [ea7561b8e]
- Updated dependencies [6e88a847f]
- Updated dependencies [37aeaa7fa]
  - blitz@2.0.0-beta.24
  - @blitzjs/auth@2.0.0-beta.24
  - @blitzjs/next@2.0.0-beta.24
  - @blitzjs/rpc@2.0.0-beta.24
  - @blitzjs/config@2.0.0-beta.24
