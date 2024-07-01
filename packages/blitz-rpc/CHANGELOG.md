# @blitzjs/rpc

## 3.0.0

### Minor Changes

- 3b10b13e6: feat: add blitz auth support for the Web `Request` API standard

  Usage using the new `withBlitzAuth` adapter in the App Router:

  ```ts
  import {withBlitzAuth} from "app/blitz-server"

  export const {POST} = withBlitzAuth({
    POST: async (_request, _params, ctx) => {
      const session = ctx.session
      await session.$revoke()

      return new Response(
        JSON.stringify({
          userId: session.userId,
        }),
        {status: 200},
      )
    },
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

### Patch Changes

- Updated dependencies [3b10b13e6]
  - blitz@2.1.0

## 2.0.10

### Patch Changes

- Updated dependencies [318e9740d]
  - blitz@2.0.10

## 2.0.9

### Patch Changes

- 5a14306f7: fix export `enhancePrisma` in client
- Updated dependencies [5a14306f7]
  - blitz@2.0.9

## 2.0.8

### Patch Changes

- Updated dependencies [5e61a1681]
- Updated dependencies [77555468f]
  - blitz@2.0.8

## 2.0.7

### Patch Changes

- ee7bf87ec: Turbopack support for Blitz

  This PR includes the changes required to make the Blitz loaders work with Turbopack.

  Usage:

  ```bash
  pnpm blitz dev --turbo
  ```

- Updated dependencies [ee7bf87ec]
- Updated dependencies [178c152b2]
  - blitz@2.0.7

## 2.0.6

### Patch Changes

- Updated dependencies [76a2544f9]
  - blitz@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [6f54841b7]
  - blitz@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies [dd604c767]
- Updated dependencies [28a79040e]
  - blitz@2.0.4

## 2.0.3

### Patch Changes

- 2f5c8a3a0: Address missing sodium native prebuilds required to use secure-password during server rendering
- Updated dependencies [2f5c8a3a0]
  - blitz@2.0.3

## 2.0.2

### Patch Changes

- e8fd12e4f: Fix: windows slash correction for rpc resolvers
- Updated dependencies [e8fd12e4f]
  - blitz@2.0.2

## 2.0.1

### Patch Changes

- 8782aae64: Fix outdated code in npm caused in during exit to stable release
- Updated dependencies [8782aae64]
  - blitz@2.0.1

## 2.0.0

### Minor Changes

- 72a4e594a: internal: remove unneeed useSession from useQuery hooks
- c1e004063: transpile packages to es2015 to support older browsers
- eda14fa8a: Add ability to format the error on the server before returning it to the client.
- 270361886: change rpc route basepath to be one folder higher when using includeRPC in monorepos
- cadefb88e: - New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
  - New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
  - New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
  - Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps
- 6ece09613: Decoupled Blitz RPC from Blitz Auth to allow independent use.
- 55a43ce1f: maybe fix anon session CSRF issue + add ability to customize anon session expiry time
- 03bad3175: fix Cannot read properties of null (reading 'isReady') for pnpm/yarn v3
- c0a3b1ee3: Fix mutability bug in RPC configuration
- e5cd2c862: expose `ctx` to `rpcHandler` error callbacks in [[...blitz]].ts files
- b493c93f8: fix resolverPath:root and make it work with monorepo resolvers

### Patch Changes

- db7233db6: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- 5166e5e03: (feat) upgrade tslog to v4.8.2
- 4cad9cca2: Add queryClient to RPC Plugin exports
- c721c104d: Pass `signal` from useQuery to Blitz internal rpc client to be able to cancel queries on unmount
- 072929109: Add invokeWithCtx function
- 8c247e26e: Switch from jest to vitest in new app templates
- 86e8eb7c8: Add helpful error message when RPC resolvers have the same path
- 2533caf48: Fix return type of `requestMiddlewares` in `RpcServerPlugin`
- d692b4c1d: Fix suspense error codegen patch for nextjs versions 13-13.0.6
- c213d521c: Fix issue with the route name that's generated for nested routes in @blitzjs/rpc. This was causing issues for windows users.
- 8b4bf999c: Update dependencies
- 1476a577b: Fix release
- c7ac86b85: Fixes enormous memory consumption of the dev server by changing the default import strategy to "require" instead of "import" which in webpack causes multiple chunks to be created for each import.

  ## Blitz Configuration

  To configure this behaviour, you can add the following to your next.config.js:

  ```js
  /**
   * @type {import('@blitzjs/next').BlitzConfig}
   **/
  const config = {
    blitz: {
      resolversDynamicImport: true,
    },
  }
  ```

  When `resolversDynamicImport` is set to `true`, the import strategy will be "import" instead of "require".

  ### On Vercel

  If you are using Vercel, `resolversDynamicImport` will be set to `true` by default, since it is better for the separate chunks to be create for serverless lambdas.

- 630c71812: Use internal branded blitz logger for @blitzjs/rpc
- bf1b2c824: fix route manifest codegen
- 0b94a4503: Upgrade superjson to the latest version
- ceb7db274: Add an opt-in GET request support to RPC specification by exporting a `config` object that has the `httpMethod` property.
  from `query` files.
- 0edeaa37a: Allow for custom page extensions for the wildcard blitz route. For example [...blitz].api.ts. For more information vist https://nextjs.org/docs/api-reference/next.config.js/custom-page-extensions
- 7b63f0f1f: Allow the updater function in setQueryData to return undefined to match react-query typings
- bee19a259: Support RPC error middleware
- c11f0401c: Update Next.js version and addBasePath location
- f6dac093d: Improve RPC logging: print `resolverName()` insetad of `/resolverName()`
- 3ddb57072: ⚠️ Breaking Change:
  Next.js version 13.5 or above is now required to use `@blitzjs/next`

  Fix `Error: Cannot find module 'next/dist/shared/lib/router/utils/resolve-href'` by updating the location of next.js internal function.

- b84c5bedb: Next 14 Compatibility
- 3bcbad1a9: - Introduce Blitz RPC's logging system to the `invoke` function which is the recommended way to call resolvers in nextjs `app` directory's react server components.

  - This refactor also removes the re-introduced dependency between `blitz-auth` and `blitz-rpc`, allowing independent usage of `blitz-rpc`

- 19898a488: Fix for tslog error `TypeError: Cannot read properties of undefined (reading 'map')` while using custom errors.
- f84d77a42: Fix return type of the `invoke` method from returning type function to return the type of resolved data
- 6811eab1a: Allow `.tsx` & `.jsx` file extensions to be used for resolvers
- 20fc9f80f: Fix SSP / SP not prefetching queries correctly
- 46a34c7b3: initial publish
- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- ed2b0e22c: Add ability to put your query and mutation resolvers in a separate monorepo folder, allowing you to use them in multiple apps.
- df7cee84a: Fix pipe resolver return type
- c3c789740: Updates internal functions and tests to support blitz apps that run tests with vitest
- 0f4926fd1: Set current Blitz tag to latest
- 8aee25c58: getQueryClient function & queryClient codemod updates & shared plugin config
- 807a2b564: Fixes peer dependency warnings
- 650a157e1: fix: allow `GET` requests without `params` and `meta` keys
- 1d9804a61: Remove references to the logging package
- 17ce29e5e: Update RPC plugin setup in templates
- f52ca398e: Upgrade react-query to v4
- 727734955: ### Now we can configure Blitz RPC in the following way,

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

- bec9512e3: Allow resolverPath to be a function which is ran for every file path that is converted to RPC Route
- a3e6c49c4: Fixes the supports-color warning for pnpm
- 490280240: Add `getQueryData` utility to get an existing query's cached data
- 0025856b9: Support full api of tanstack invalidateQueries
- 2073714f8: testing set dist-tag
- 716e188d1: Fix queries/mutations lookup on Windows
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

- aa34661fa: Fix invalidateQuery generating wrong param when no param argument is passed
- b33db0828: Fix ambigious class warning log & upgrade superjson from 1.9.1 to 1.11.0
- 8e0c9d76b: Migrate over recipe functionality from legacy framework & expose recipe builder helper functions that find and modify next.config.js, blitz-server & blitz-client.
- 9620ef6b1: moves zod to devDependencies
- 3b213a35b: Remove debug console.log
- 00bd849ee: new app template
- dfd2408e9: Add resolverBasePath to Blitz config to change the way rpc routes are generated
- 2cc888eff: Beta release
- Updated dependencies [db7233db6]
- Updated dependencies [1569bd53e]
- Updated dependencies [cee2dec17]
- Updated dependencies [5166e5e03]
- Updated dependencies [9db6c8855]
- Updated dependencies [1e1bb73b2]
- Updated dependencies [83b355900]
- Updated dependencies [c1e004063]
- Updated dependencies [365e67094]
- Updated dependencies [fd31e56bc]
- Updated dependencies [74a14b704]
- Updated dependencies [aec1bb076]
- Updated dependencies [82649f341]
- Updated dependencies [f397cc203]
- Updated dependencies [cadefb88e]
- Updated dependencies [271c58ac6]
- Updated dependencies [8f166a5db]
- Updated dependencies [c5572bec6]
- Updated dependencies [86e8eb7c8]
- Updated dependencies [99205f52d]
- Updated dependencies [6ece09613]
- Updated dependencies [928e840b5]
- Updated dependencies [6f18cbdc9]
- Updated dependencies [ea7561b8e]
- Updated dependencies [1436e7618]
- Updated dependencies [696f48c4e]
- Updated dependencies [d98e4bac4]
- Updated dependencies [90f1741da]
- Updated dependencies [4a9aa9f7f]
- Updated dependencies [d692b4c1d]
- Updated dependencies [638f2319b]
- Updated dependencies [c213d521c]
- Updated dependencies [5ea068b28]
- Updated dependencies [1d863f352]
- Updated dependencies [8b4bf999c]
- Updated dependencies [1476a577b]
- Updated dependencies [a6e81f156]
- Updated dependencies [cacb65d63]
- Updated dependencies [630c71812]
- Updated dependencies [bf1b2c824]
- Updated dependencies [240f3f347]
- Updated dependencies [55b1cb204]
- Updated dependencies [54db8a46d]
- Updated dependencies [962eb58af]
- Updated dependencies [54a66a95d]
- Updated dependencies [9fe0cc546]
- Updated dependencies [0b94a4503]
- Updated dependencies [af58e2b23]
- Updated dependencies [78fd5c489]
- Updated dependencies [62bf12b5c]
- Updated dependencies [09e0c68db]
- Updated dependencies [abb1ad5d1]
- Updated dependencies [3a602b613]
- Updated dependencies [ceb7db274]
- Updated dependencies [2ade7268e]
- Updated dependencies [0edeaa37a]
- Updated dependencies [f0ca738d5]
- Updated dependencies [0936cb38a]
- Updated dependencies [989691ec8]
- Updated dependencies [4d7d126d9]
- Updated dependencies [8e5903c0f]
- Updated dependencies [30fd61316]
- Updated dependencies [6f4349896]
- Updated dependencies [942536d9a]
- Updated dependencies [666a3ae3e]
- Updated dependencies [a80d2a8f7]
- Updated dependencies [3ddb57072]
- Updated dependencies [abe2afccd]
- Updated dependencies [b84c5bedb]
- Updated dependencies [a6f32d1d0]
- Updated dependencies [b97366c42]
- Updated dependencies [348fd6f5e]
- Updated dependencies [3bcbad1a9]
- Updated dependencies [0a8b0cb35]
- Updated dependencies [8490b0724]
- Updated dependencies [19898a488]
- Updated dependencies [93851d90c]
- Updated dependencies [6811eab1a]
- Updated dependencies [20fc9f80f]
- Updated dependencies [8dedca1a2]
- Updated dependencies [3511d5b69]
- Updated dependencies [46a34c7b3]
- Updated dependencies [e82a79be5]
- Updated dependencies [890b0c0c9]
- Updated dependencies [430f6ec78]
- Updated dependencies [adabb11a0]
- Updated dependencies [38d945a3f]
- Updated dependencies [c3c789740]
- Updated dependencies [240f378b5]
- Updated dependencies [df3265b85]
- Updated dependencies [89bf993a1]
- Updated dependencies [3f9fe8f04]
- Updated dependencies [fe8c937d2]
- Updated dependencies [0ac6e1712]
- Updated dependencies [807a2b564]
- Updated dependencies [1d9804a61]
- Updated dependencies [41608c4c3]
- Updated dependencies [a0596279b]
- Updated dependencies [88caa18e6]
- Updated dependencies [022392c12]
- Updated dependencies [c126b8191]
- Updated dependencies [c9cf7adc3]
- Updated dependencies [1b798d9a0]
- Updated dependencies [ea7561b8e]
- Updated dependencies [727734955]
- Updated dependencies [f39ba1ff1]
- Updated dependencies [161270e3b]
- Updated dependencies [b6b9a1c5a]
- Updated dependencies [8bcb471a5]
- Updated dependencies [a3e6c49c4]
- Updated dependencies [15d22af24]
- Updated dependencies [454591293]
- Updated dependencies [2073714f8]
- Updated dependencies [8aa22a0b2]
- Updated dependencies [37aeaa7fa]
- Updated dependencies [b918055bf]
- Updated dependencies [aa34661fa]
- Updated dependencies [61888d1a3]
- Updated dependencies [dd5f51744]
- Updated dependencies [ce4536833]
- Updated dependencies [fb32903bf]
- Updated dependencies [b33db0828]
- Updated dependencies [f15a51901]
- Updated dependencies [10f98c681]
- Updated dependencies [9674efc0b]
- Updated dependencies [8e0c9d76b]
- Updated dependencies [d5b8faa86]
- Updated dependencies [a3bbe6ce3]
- Updated dependencies [e2c18895d]
- Updated dependencies [00bd849ee]
- Updated dependencies [ffa7b5ccc]
- Updated dependencies [1f6b0b54c]
- Updated dependencies [527e48ac3]
- Updated dependencies [01f3a03ea]
- Updated dependencies [2cc888eff]
  - blitz@2.0.0

## 2.0.0-beta.37

### Minor Changes

- e5cd2c862: expose `ctx` to `rpcHandler` error callbacks in [[...blitz]].ts files

### Patch Changes

- 86e8eb7c8: Add helpful error message when RPC resolvers have the same path
- b84c5bedb: Next 14 Compatibility
- Updated dependencies [86e8eb7c8]
- Updated dependencies [b84c5bedb]
  - blitz@2.0.0-beta.37

## 2.0.0-beta.36

### Patch Changes

- Updated dependencies [09e0c68db]
  - blitz@2.0.0-beta.36

## 2.0.0-beta.35

### Patch Changes

- 3bcbad1a9: - Introduce Blitz RPC's logging system to the `invoke` function which is the recommended way to call resolvers in nextjs `app` directory's react server components.

  - This refactor also removes the re-introduced dependency between `blitz-auth` and `blitz-rpc`, allowing independent usage of `blitz-rpc`

- Updated dependencies [cee2dec17]
- Updated dependencies [aec1bb076]
- Updated dependencies [b97366c42]
- Updated dependencies [3bcbad1a9]
  - blitz@2.0.0-beta.35

## 2.0.0-beta.34

### Patch Changes

- 3ddb57072: ⚠️ Breaking Change:
  Next.js version 13.5 or above is now required to use `@blitzjs/next`

  Fix `Error: Cannot find module 'next/dist/shared/lib/router/utils/resolve-href'` by updating the location of next.js internal function.

- Updated dependencies [30fd61316]
- Updated dependencies [3ddb57072]
- Updated dependencies [fe8c937d2]
  - blitz@2.0.0-beta.34

## 2.0.0-beta.33

### Patch Changes

- 19898a488: Fix for tslog error `TypeError: Cannot read properties of undefined (reading 'map')` while using custom errors.
- 6811eab1a: Allow `.tsx` & `.jsx` file extensions to be used for resolvers
- Updated dependencies [19898a488]
- Updated dependencies [6811eab1a]
- Updated dependencies [022392c12]
  - blitz@2.0.0-beta.33

## 2.0.0-beta.32

### Patch Changes

- Updated dependencies [82649f341]
  - blitz@2.0.0-beta.32

## 2.0.0-beta.31

### Patch Changes

- Updated dependencies [90f1741da]
- Updated dependencies [df3265b85]
  - blitz@2.0.0-beta.31

## 2.0.0-beta.30

### Patch Changes

- 727734955: ### Now we can configure Blitz RPC in the following way,

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

- Updated dependencies [c5572bec6]
- Updated dependencies [727734955]
  - blitz@2.0.0-beta.30

## 2.0.0-beta.29

### Patch Changes

- Updated dependencies [b6b9a1c5a]
- Updated dependencies [61888d1a3]
  - blitz@2.0.0-beta.29

## 2.0.0-beta.28

### Patch Changes

- 5166e5e03: (feat) upgrade tslog to v4.8.2
- 2533caf48: Fix return type of `requestMiddlewares` in `RpcServerPlugin`
- c7ac86b85: Fixes enormous memory consumption of the dev server by changing the default import strategy to "require" instead of "import" which in webpack causes multiple chunks to be created for each import.

  ## Blitz Configuration

  To configure this behaviour, you can add the following to your next.config.js:

  ```js
  /**
   * @type {import('@blitzjs/next').BlitzConfig}
   **/
  const config = {
    blitz: {
      resolversDynamicImport: true,
    },
  }
  ```

  When `resolversDynamicImport` is set to `true`, the import strategy will be "import" instead of "require".

  ### On Vercel

  If you are using Vercel, `resolversDynamicImport` will be set to `true` by default, since it is better for the separate chunks to be create for serverless lambdas.

- Updated dependencies [5166e5e03]
  - blitz@2.0.0-beta.28

## 2.0.0-beta.27

### Minor Changes

- eda14fa8a: Add ability to format the error on the server before returning it to the client.

### Patch Changes

- blitz@2.0.0-beta.27

## 2.0.0-beta.26

### Patch Changes

- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- Updated dependencies [e82a79be5]
- Updated dependencies [38d945a3f]
  - blitz@2.0.0-beta.26

## 2.0.0-beta.25

### Patch Changes

- f84d77a42: Fix return type of the `invoke` method from returning type function to return the type of resolved data
  - blitz@2.0.0-beta.25

## 2.0.0-beta.24

### Minor Changes

- cadefb88e: - New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
  - New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
  - New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
  - Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps

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
- Updated dependencies [ea7561b8e]
- Updated dependencies [ea7561b8e]
- Updated dependencies [37aeaa7fa]
  - blitz@2.0.0-beta.24

## 2.0.0-beta.23

### Patch Changes

- c3c789740: Updates internal functions and tests to support blitz apps that run tests with vitest
- Updated dependencies [c3c789740]
  - blitz@2.0.0-beta.23

## 2.0.0-beta.22

### Minor Changes

- 270361886: change rpc route basepath to be one folder higher when using includeRPC in monorepos

### Patch Changes

- Updated dependencies [989691ec8]
- Updated dependencies [8aa22a0b2]
  - blitz@2.0.0-beta.22

## 2.0.0-beta.21

### Patch Changes

- d692b4c1d: Fix suspense error codegen patch for nextjs versions 13-13.0.6
- 0025856b9: Support full api of tanstack invalidateQueries
- Updated dependencies [d692b4c1d]
- Updated dependencies [10f98c681]
- Updated dependencies [d5b8faa86]
  - blitz@2.0.0-beta.21

## 2.0.0-beta.20

### Minor Changes

- 6ece0961: Decoupled Blitz RPC from Blitz Auth to allow independent use.
- 03bad317: fix Cannot read properties of null (reading 'isReady') for pnpm/yarn v3

### Patch Changes

- 8c247e26: Switch from jest to vitest in new app templates
- 650a157e: fix: allow `GET` requests without `params` and `meta` keys
- Updated dependencies [74a14b70]
- Updated dependencies [6ece0961]
- Updated dependencies [a0596279]
  - blitz@2.0.0-beta.20

## 2.0.0-beta.19

### Minor Changes

- c1e00406: transpile packages to es2015 to support older browsers
- b493c93f: fix resolverPath:root and make it work with monorepo resolvers

### Patch Changes

- b33db082: Fix ambigious class warning log & upgrade superjson from 1.9.1 to 1.11.0
- Updated dependencies [c1e00406]
  - @blitzjs/auth@2.0.0-beta.19

## 2.0.0-beta.18

### Minor Changes

- 72a4e594: internal: remove unneeed useSession from useQuery hooks
- c0a3b1ee: Fix mutability bug in RPC configuration

### Patch Changes

- ed2b0e22: Add ability to put your query and mutation resolvers in a separate monorepo folder, allowing you to use them in multiple apps.
  - @blitzjs/auth@2.0.0-beta.18

## 2.0.0-beta.17

### Patch Changes

- 8b4bf999: Update dependencies
- Updated dependencies [8b4bf999]
- Updated dependencies [97469a12]
  - @blitzjs/auth@2.0.0-beta.17

## 2.0.0-beta.16

### Minor Changes

- 55a43ce1: maybe fix anon session CSRF issue + add ability to customize anon session expiry time

### Patch Changes

- ceb7db27: Add an opt-in GET request support to RPC specification by exporting a `config` object that has the `httpMethod` property.
  from `query` files.
- Updated dependencies [55a43ce1]
  - @blitzjs/auth@2.0.0-beta.16

## 2.0.0-beta.15

### Patch Changes

- @blitzjs/auth@2.0.0-beta.15

## 2.0.0-beta.14

### Patch Changes

- @blitzjs/auth@2.0.0-beta.14

## 2.0.0-beta.13

### Patch Changes

- 7b63f0f1: Allow the updater function in setQueryData to return undefined to match react-query typings
  - @blitzjs/auth@2.0.0-beta.13

## 2.0.0-beta.12

### Patch Changes

- @blitzjs/auth@2.0.0-beta.12

## 2.0.0-beta.11

### Patch Changes

- 1476a577: Fix release
- Updated dependencies [1476a577]
  - @blitzjs/auth@2.0.0-beta.11

## 2.0.0-beta.10

### Patch Changes

- 0edeaa37: Allow for custom page extensions for the wildcard blitz route. For example [...blitz].api.ts. For more information vist https://nextjs.org/docs/api-reference/next.config.js/custom-page-extensions
- aa34661f: Fix invalidateQuery generating wrong param when no param argument is passed
- 8e0c9d76: Migrate over recipe functionality from legacy framework & expose recipe builder helper functions that find and modify next.config.js, blitz-server & blitz-client.
- Updated dependencies [9fe0cc54]
  - @blitzjs/auth@2.0.0-beta.10

## 2.0.0-beta.4

### Patch Changes

- c213d521: Fix issue with the route name that's generated for nested routes in @blitzjs/rpc. This was causing issues for windows users.
- 0b94a450: Upgrade superjson to the latest version
- f6dac093: Improve RPC logging: print `resolverName()` insetad of `/resolverName()`
- Updated dependencies [713aead9]
  - @blitzjs/auth@2.0.0-beta.4

## 2.0.0-beta.3

### Patch Changes

- @blitzjs/auth@2.0.0-beta.3

## 2.0.0-beta.2

### Patch Changes

- db7233db: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- Updated dependencies [db7233db]
  - @blitzjs/auth@2.0.0-beta.2

## 2.0.0-beta.1

### Patch Changes

- 0f4926fd: Set current Blitz tag to latest
- Updated dependencies [0f4926fd]
  - @blitzjs/auth@2.0.0-beta.1

## 2.0.0-beta.72

### Patch Changes

- 2cc888ef: Beta release
- Updated dependencies [2cc888ef]
  - @blitzjs/auth@2.0.0-beta.72

## 2.0.0-alpha.71

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.71

## 2.0.0-alpha.70

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.70

## 2.0.0-alpha.69

### Patch Changes

- 49028024: Add `getQueryData` utility to get an existing query's cached data
  - @blitzjs/auth@2.0.0-alpha.69

## 2.0.0-alpha.68

### Patch Changes

- 630c7181: Use internal branded blitz logger for @blitzjs/rpc
  - @blitzjs/auth@2.0.0-alpha.68

## 2.0.0-alpha.67

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.67

## 2.0.0-alpha.66

### Patch Changes

- 807a2b56: Fixes peer dependency warnings
- a3e6c49c: Fixes the supports-color warning for pnpm
- 9620ef6b: moves zod to devDependencies
- Updated dependencies [a3e6c49c]
  - @blitzjs/auth@2.0.0-alpha.66

## 2.0.0-alpha.65

### Patch Changes

- Updated dependencies [dd5f5174]
  - blitz@2.0.0-alpha.65
  - @blitzjs/auth@2.0.0-alpha.65

## 2.0.0-alpha.64

### Patch Changes

- Updated dependencies [54db8a46]
- Updated dependencies [62bf12b5]
  - blitz@2.0.0-alpha.64
  - @blitzjs/auth@2.0.0-alpha.64

## 2.0.0-alpha.63

### Patch Changes

- f52ca398: Upgrade react-query to v4
  - @blitzjs/auth@2.0.0-alpha.63
  - blitz@2.0.0-alpha.63

## 2.0.0-alpha.62

### Patch Changes

- Updated dependencies [365e6709]
  - blitz@2.0.0-alpha.62
  - @blitzjs/auth@2.0.0-alpha.62

## 2.0.0-alpha.61

### Patch Changes

- Updated dependencies [240f378b]
  - blitz@2.0.0-alpha.61
  - @blitzjs/auth@2.0.0-alpha.61

## 2.0.0-alpha.60

### Patch Changes

- Updated dependencies [1d863f35]
  - blitz@2.0.0-alpha.60
  - @blitzjs/auth@2.0.0-alpha.60

## 2.0.0-alpha.59

### Patch Changes

- 3b213a35: Remove debug console.log
  - @blitzjs/auth@2.0.0-alpha.59
  - blitz@2.0.0-alpha.59

## 2.0.0-alpha.58

### Patch Changes

- c721c104: Pass `signal` from useQuery to Blitz internal rpc client to be able to cancel queries on unmount
- Updated dependencies [83b35590]
  - blitz@2.0.0-alpha.58
  - @blitzjs/auth@2.0.0-alpha.58

## 2.0.0-alpha.57

### Patch Changes

- 716e188d: Fix queries/mutations lookup on Windows
- Updated dependencies [3511d5b6]
  - blitz@2.0.0-alpha.57
  - @blitzjs/auth@2.0.0-alpha.57

## 2.0.0-alpha.56

### Patch Changes

- Updated dependencies [3f20a474]
- Updated dependencies [abb1ad5d]
- Updated dependencies [abe2afcc]
- Updated dependencies [0ac6e171]
- Updated dependencies [8bcb471a]
  - @blitzjs/auth@2.0.0-alpha.56
  - blitz@2.0.0-alpha.56

## 2.0.0-alpha.55

### Patch Changes

- df7cee84: Fix pipe resolver return type
- Updated dependencies [8f166a5d]
- Updated dependencies [54a66a95]
- Updated dependencies [1c809094]
  - blitz@2.0.0-alpha.55
  - @blitzjs/auth@2.0.0-alpha.55

## 2.0.0-alpha.54

### Patch Changes

- 20fc9f80: Fix SSP / SP not prefetching queries correctly
- Updated dependencies [f397cc20]
- Updated dependencies [cacb65d6]
- Updated dependencies [348fd6f5]
- Updated dependencies [20fc9f80]
- Updated dependencies [a3bbe6ce]
- Updated dependencies [ffa7b5cc]
  - blitz@2.0.0-alpha.54
  - @blitzjs/auth@2.0.0-alpha.54

## 2.0.0-alpha.53

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.53
- blitz@2.0.0-alpha.53

## 2.0.0-alpha.52

### Patch Changes

- blitz@2.0.0-alpha.52
- @blitzjs/auth@2.0.0-alpha.52

## 2.0.0-alpha.51

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.51
- blitz@2.0.0-alpha.51

## 2.0.0-alpha.50

### Patch Changes

- c11f0401: Update Next.js version and addBasePath location
  - blitz@2.0.0-alpha.50
  - @blitzjs/auth@2.0.0-alpha.50

## 2.0.0-alpha.49

### Patch Changes

- bec9512e: Allow resolverPath to be a function which is ran for every file path that is converted to RPC Route
  - @blitzjs/auth@2.0.0-alpha.49
  - blitz@2.0.0-alpha.49

## 2.0.0-alpha.48

### Patch Changes

- Updated dependencies [93851d90]
  - blitz@2.0.0-alpha.48
  - @blitzjs/auth@2.0.0-alpha.48

## 2.0.0-alpha.47

### Patch Changes

- 1d9804a6: Remove references to the logging package
- Updated dependencies [1d9804a6]
  - blitz@2.0.0-alpha.47
  - @blitzjs/auth@2.0.0-alpha.47

## 2.0.0-alpha.46

### Patch Changes

- bee19a25: Support RPC error middleware
  - @blitzjs/auth@2.0.0-alpha.46
  - blitz@2.0.0-alpha.46

## 2.0.0-alpha.45

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.45
- blitz@2.0.0-alpha.45

## 2.0.0-alpha.44

### Patch Changes

- Updated dependencies [7817fe3a]
  - @blitzjs/auth@2.0.0-alpha.44
  - blitz@2.0.0-alpha.44

## 2.0.0-alpha.43

### Patch Changes

- Updated dependencies [527e48ac]
  - blitz@2.0.0-alpha.43
  - @blitzjs/auth@2.0.0-alpha.43

## 2.0.0-alpha.42

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.42
- blitz@2.0.0-alpha.42

## 2.0.0-alpha.41

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.41
- blitz@2.0.0-alpha.41

## 2.0.0-alpha.40

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.40
- blitz@2.0.0-alpha.40

## 2.0.0-alpha.39

### Patch Changes

- Updated dependencies [b918055b]
  - blitz@2.0.0-alpha.39
  - @blitzjs/auth@2.0.0-alpha.39

## 2.0.0-alpha.38

### Patch Changes

- 8aee25c5: getQueryClient function & queryClient codemod updates & shared plugin config
  - blitz@2.0.0-alpha.38
  - @blitzjs/auth@2.0.0-alpha.38

## 2.0.0-alpha.37

### Patch Changes

- Updated dependencies [a80d2a8f]
  - blitz@2.0.0-alpha.37
  - @blitzjs/auth@2.0.0-alpha.37

## 2.0.0-alpha.36

### Patch Changes

- 4cad9cca: Add queryClient to RPC Plugin exports
  - blitz@2.0.0-alpha.36
  - @blitzjs/auth@2.0.0-alpha.36

## 2.0.0-alpha.35

### Patch Changes

- blitz@2.0.0-alpha.35
- @blitzjs/auth@2.0.0-alpha.35

## 2.0.0-alpha.34

### Patch Changes

- dfd2408e: Add resolverBasePath to Blitz config to change the way rpc routes are generated
  - @blitzjs/auth@2.0.0-alpha.34
  - blitz@2.0.0-alpha.34

## 2.0.0-alpha.33

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.33
- blitz@2.0.0-alpha.33

## 2.0.0-alpha.32

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.32
- blitz@2.0.0-alpha.32

## 2.0.0-alpha.31

### Patch Changes

- 17ce29e5: Update RPC plugin setup in templates
  - blitz@2.0.0-alpha.31
  - @blitzjs/auth@2.0.0-alpha.31

## 2.0.0-alpha.30

### Patch Changes

- Updated dependencies [ce453683]
  - blitz@2.0.0-alpha.30
  - @blitzjs/auth@2.0.0-alpha.30

## 2.0.0-alpha.29

### Patch Changes

- Updated dependencies [962eb58a]
  - blitz@2.0.0-alpha.29
  - @blitzjs/auth@2.0.0-alpha.29

## 2.0.0-alpha.28

### Patch Changes

- blitz@2.0.0-alpha.28
- @blitzjs/auth@2.0.0-alpha.28

## 2.0.0-alpha.27

### Patch Changes

- 07292910: Add invokeWithCtx function
  - @blitzjs/auth@2.0.0-alpha.27
  - blitz@2.0.0-alpha.27

## 2.0.0-alpha.26

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.26
- blitz@2.0.0-alpha.26

## 2.0.0-alpha.25

### Patch Changes

- Updated dependencies [1436e761]
- Updated dependencies [1436e761]
  - blitz@2.0.0-alpha.25
  - @blitzjs/auth@2.0.0-alpha.25

## 2.0.0-alpha.24

### Patch Changes

- Updated dependencies [8490b072]
  - blitz@2.0.0-alpha.24
  - @blitzjs/auth@2.0.0-alpha.24

## 2.0.0-alpha.23

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.23
  - @blitzjs/auth@2.0.0-alpha.23

## 2.0.0-alpha.22

### Patch Changes

- Updated dependencies
- Updated dependencies [89bf993a]
  - blitz@2.0.0-alpha.22
  - @blitzjs/auth@2.0.0-alpha.22

## 2.0.0-alpha.21

### Patch Changes

- blitz@2.0.0-alpha.21
- @blitzjs/auth@2.0.0-alpha.21

## 2.0.0-alpha.20

### Patch Changes

- testing set dist-tag
- Updated dependencies
  - blitz@2.0.0-alpha.20
  - @blitzjs/auth@2.0.0-alpha.20

## 2.0.0-alpha.19

### Patch Changes

- blitz@2.0.0-alpha.19
- @blitzjs/auth@2.0.0-alpha.19

## 2.0.0-alpha.18

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.18
  - @blitzjs/auth@2.0.0-alpha.18

## 2.0.0-alpha.17

### Patch Changes

- blitz@2.0.0-alpha.17
- @blitzjs/auth@2.0.0-alpha.17

## 2.0.0-alpha.16

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.16
  - @blitzjs/auth@2.0.0-alpha.16

## 2.0.0-alpha.15

### Patch Changes

- blitz@2.0.0-alpha.15
- @blitzjs/auth@2.0.0-alpha.15

## 2.0.0-alpha.14

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.14
  - @blitzjs/auth@2.0.0-alpha.14

## 2.0.0-alpha.13

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.13
  - @blitzjs/auth@2.0.0-alpha.13

## 2.0.0-alpha.12

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.12
  - @blitzjs/auth@2.0.0-alpha.12

## 2.0.0-alpha.11

### Patch Changes

- @blitzjs/auth@2.0.0-alpha.11
- blitz@2.0.0-alpha.11

## 2.0.0-alpha.10

### Patch Changes

- blitz@2.0.0-alpha.10
- @blitzjs/auth@2.0.0-alpha.10

## 2.0.0-alpha.9

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.9
  - @blitzjs/auth@2.0.0-alpha.9

## 2.0.0-alpha.8

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.8
  - @blitzjs/auth@2.0.0-alpha.8

## 2.0.0-alpha.7

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.7
  - @blitzjs/auth@2.0.0-alpha.7

## 2.0.0-alpha.6

### Patch Changes

- fix route manifest codegen
- Updated dependencies
  - blitz@2.0.0-alpha.6
  - @blitzjs/auth@2.0.0-alpha.6

## 2.0.0-alpha.5

### Patch Changes

- new app template
- Updated dependencies
  - blitz@2.0.0-alpha.5
  - @blitzjs/auth@2.0.0-alpha.5

## 2.0.0-alpha.4

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.4
  - @blitzjs/auth@2.0.0-alpha.4

## 2.0.0-alpha.3

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.3
  - @blitzjs/auth@2.0.0-alpha.3

## 2.0.0-alpha.2

### Patch Changes

- blitz@2.0.0-alpha.2
- @blitzjs/auth@2.0.0-alpha.2

## 2.0.0-alpha.1

### Patch Changes

- 46a34c7b: initial publish
- Updated dependencies [46a34c7b]
  - blitz@2.0.0-alpha.1
  - @blitzjs/auth@2.0.0-alpha.1
