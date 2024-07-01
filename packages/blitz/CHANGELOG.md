# blitz

## 2.1.0

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
  - @blitzjs/generator@3.0.0

## 2.0.10

### Patch Changes

- 318e9740d: feat: support next-auth version 4.24.7
  - @blitzjs/generator@2.0.10

## 2.0.9

### Patch Changes

- 5a14306f7: fix export `enhancePrisma` in client
  - @blitzjs/generator@2.0.9

## 2.0.8

### Patch Changes

- 5e61a1681: bug: merge existing and custom blitz turbo configs
- 77555468f: fix: add missing host while initialising the next-auth adapter
  - @blitzjs/generator@2.0.8

## 2.0.7

### Patch Changes

- ee7bf87ec: Turbopack support for Blitz

  This PR includes the changes required to make the Blitz loaders work with Turbopack.

  Usage:

  ```bash
  pnpm blitz dev --turbo
  ```

- 178c152b2: fix: patch next.js to hide intentional throws of `DYNAMIC_SERVER_USAGE`
  - @blitzjs/generator@2.0.7

## 2.0.6

### Patch Changes

- 76a2544f9: Use `SIGINT` signal instead of `SIGABRT` to stop the process, when using custom server for better compatibility with operative systems
  - @blitzjs/generator@2.0.6

## 2.0.5

### Patch Changes

- 6f54841b7: fix: getBlitzContext() can only be used in React Server Components in Nextjs 13 or higher
  - @blitzjs/generator@2.0.5

## 2.0.4

### Patch Changes

- dd604c767: perf: add filter to select only non expired sessions
- 28a79040e: feat: export `BlitzServerMiddleware` from blitz-next with stronger types
- Updated dependencies [71b995003]
  - @blitzjs/generator@2.0.4

## 2.0.3

### Patch Changes

- 2f5c8a3a0: Address missing sodium native prebuilds required to use secure-password during server rendering
- Updated dependencies [47722e045]
- Updated dependencies [595f400e9]
  - @blitzjs/generator@2.0.3

## 2.0.2

### Patch Changes

- e8fd12e4f: Fix: windows slash correction for rpc resolvers
  - @blitzjs/generator@2.0.2

## 2.0.1

### Patch Changes

- 8782aae64: Fix outdated code in npm caused in during exit to stable release
- Updated dependencies [8782aae64]
  - @blitzjs/generator@2.0.1

## 2.0.0

### Major Changes

- 942536d9a: update paginate.ts, return more params for more complex pagination control

### Minor Changes

- 83b355900: Truncate errors from `api/auth/<strategy>/callback` request to 100 characters before passing them to the `?authError=` query parameter
- c1e004063: transpile packages to es2015 to support older browsers
- 74a14b704: When db.\$reset() rejects, reject with an Error object
- cadefb88e: - New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
  - New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
  - New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
  - Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps
- 6ece09613: Decoupled Blitz RPC from Blitz Auth to allow independent use.
- 6f18cbdc9: feature: Next Auth Adapter
- 696f48c4e: some providers need extra attributes, update for wrapAppWithProvider
- 8aa22a0b2: add `currentPassword` to the default fields that are masked in the logger

### Patch Changes

- db7233db6: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- 1569bd53e: Upgrade `tslog` to the latest version
- cee2dec17: Fix bug that did not allow `Page.authenicate = {role: "" }` to correctly work
- 5166e5e03: (feat) upgrade tslog to v4.8.2
- 9db6c8855: Fix `blitz --help` CLI command not being found
- 1e1bb73b2: Fix codegen and postinstall to make work with pnpm
- 365e67094: Fixes the db seed command so that the database can disconnect after running the seed file.
- fd31e56bc: Add back blitz generate command
- aec1bb076: blitz-next: Fix `next/head` used in app directory warning
- 82649f341: Upgrade tslog to `4.9.0`.

  This due a [tslog issue](https://github.com/fullstack-build/tslog/issues/227) that causes tslog to crash when attempting to log an error whose constructor expects more than one argument.

- f397cc203: Fixes issue when generating a new blitz app with the form flag that ends up installing the wrong form library
- 271c58ac6: Comment out generate command import until we add the full support back
- 8f166a5db: Check for new versions when running CLI
- c5572bec6: blitz-auth: Fix webpack from following next-auth
- 86e8eb7c8: Add helpful error message when RPC resolvers have the same path
- 99205f52d: Use alpha version for blitz dependency, fix package manager selection
- 928e840b5: Fixes loading production env variables by default for blitz build command
- ea7561b8e: Consolidate mutations schema to new schema.{ts|js} file.
- 1436e7618: Export Zod utils from blitz core package
- d98e4bac4: Add `blitz routes` CLI command back to toolkit
- 90f1741da: blitz-auth: Support for Prisma v5

  Internal: Make `handle` a required paramter while updating the `session` modal.

- 4a9aa9f7f: set default enviornment variable to development unless build and start command
- d692b4c1d: Fix suspense error codegen patch for nextjs versions 13-13.0.6
- 638f2319b: Prevent `Minified react error #419` in production
- c213d521c: Fix issue with the route name that's generated for nested routes in @blitzjs/rpc. This was causing issues for windows users.
- 5ea068b28: Check if blitz-server & blitz-client is located in either the app or src directory and return the correct path for blitz recipes.
- 1d863f352: Fix APP_ENV not being set before loading env config
- 8b4bf999c: Update dependencies
- 1476a577b: Fix release
- a6e81f156: Add BlitzLogger plugin and allow customizing logging
- cacb65d63: Fixes wrong import of the db module in `blitz db seed` command function
- 630c71812: Use internal branded blitz logger for @blitzjs/rpc
- bf1b2c824: fix route manifest codegen
- 240f3f347: Add BlitzServerMiddleware utility function to wrap middleware in blitz server file
- 55b1cb204: Runs the codegen on the blitz build command
- 54db8a46d: Add missing value to "skip" option when choosing a package manager during new app scaffolding
- 962eb58af: detailed print env info
- 54a66a95d: Show all blitz packages when running `blitz version` command
- 9fe0cc546: Fix auth related React hydration errors by not redirecting until after component mount.
- 0b94a4503: Upgrade superjson to the latest version
- af58e2b23: Add a global Blitz version check when generating a new Blitz project to ensure users use the latest Blitz.
- 78fd5c489: Fix Blitz Install issue that gets stuck on "Generating file diff"
- 62bf12b5c: Fix blitz codegen to work with monorepos
- 09e0c68db: Automatically authorize role with usage of `redirectAuthenticatedTo` in `useAuthenticatedBlitzContext` utility
- abb1ad5d1: Improve codemod utilities
- 3a602b613: Fix `blitz install` not working due to missing `blitz/installer` dependency
- ceb7db274: Add an opt-in GET request support to RPC specification by exporting a `config` object that has the `httpMethod` property.
  from `query` files.
- 2ade7268e: Add `blitz export` CLI command to toolkit
- 0edeaa37a: Allow for custom page extensions for the wildcard blitz route. For example [...blitz].api.ts. For more information vist https://nextjs.org/docs/api-reference/next.config.js/custom-page-extensions
- f0ca738d5: Run codegen tasks on blitz dev command
- 0936cb38a: Patch Next.js Suspense issue in all node environments. Previously we only patched it in the `development` environment, but now we make sure it gets patched in the `production` env (with the `blitz build` command) as well.
- 989691ec8: Use `src` instead of `app` folder for `blitz generate custom-template`
- 4d7d126d9: Run `prisma generate` as a `blitz codegen` step if "prisma" is found in project's dependencies
- 8e5903c0f: Fix `cannot find module db error` in JavaScript template. Replace requiring the config using `esbuild` with parsing using `jscodeshift` to get the `cliConfig` values. Added logic to find the `blitz-server` file in `src` directory
- 30fd61316: - Removes language selection step from `blitz new` menu
  - Make `formik` the default/recommended form library
- 6f4349896: Fix "Ambiguous class detected" errors reported by SuperJson by removing duplicated export from errors.ts file
- 666a3ae3e: fix broken cli versioning
- a80d2a8f7: rename middleware type for blitz server plugin
- 3ddb57072: ⚠️ Breaking Change:
  Next.js version 13.5 or above is now required to use `@blitzjs/next`

  Fix `Error: Cannot find module 'next/dist/shared/lib/router/utils/resolve-href'` by updating the location of next.js internal function.

- abe2afccd: Fix a long-standing issue with occasional blitz auth flakiness

  This bug would sometimes cause users to be logged out or to experience an CSRFTokenMismatchError. This bug, when encountered, usually by lots of setPublicData or session.create calls, would not set the cookie headers correctly resulting in cookies being set to a previous state or in a possibly undefined state.

  There are no security concerns as far as I can tell.

- b84c5bedb: Next 14 Compatibility
- a6f32d1d0: Export enhancePrisma for client again (Fixes #3964)
- b97366c42: Remove unintended dependency on next-auth by removing it from the core build of @blitzjs/auth

  ⚠️ Breaking Change for current users of `withNextAuthAdapter`

  Update your import in `next.config.js` in the following way

  ```diff
  -const { withNextAuthAdapter } = require("@blitzjs/auth")
  +const { withNextAuthAdapter } = require("@blitzjs/auth/next-auth")
  ```

- 348fd6f5e: Fix redirectAuthenticatedTo errors
- 3bcbad1a9: - Introduce Blitz RPC's logging system to the `invoke` function which is the recommended way to call resolvers in nextjs `app` directory's react server components.

  - This refactor also removes the re-introduced dependency between `blitz-auth` and `blitz-rpc`, allowing independent usage of `blitz-rpc`

- 0a8b0cb35: Fix Custom Server TS error - add `es6` target config to esbuild
- 8490b0724: test automated publish
- 19898a488: Fix for tslog error `TypeError: Cannot read properties of undefined (reading 'map')` while using custom errors.
- 93851d90c: Handle duplicate imports with Blitz upgrade-legacy codemod
- 6811eab1a: Allow `.tsx` & `.jsx` file extensions to be used for resolvers
- 20fc9f80f: Fix SSP / SP not prefetching queries correctly
- 8dedca1a2: downgrade pkg-dir to non-esm only version
- 3511d5b69: Temporarily skip version check
- 46a34c7b3: initial publish
- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- 890b0c0c9: Improve `blitz new` messaging and fix minor issues
- 430f6ec78: Only generate the prisma client if it's not found in node_modules when running a blitz cli command.
- adabb11a0: - Add mounted check to withBlitz
  - Upgrade @types/react, fix typings inside @blitzjs/next
  - Support prefetchBlitzQuery in gSP and gSSP
  - Add db seed cli command
  - Add try/catch to changePassword mutation
- 38d945a3f: The issue is that the version provided, "13.2", is not a valid SemVer version. A valid SemVer version must have three components: major, minor, and patch (e.g., "13.2.0").
- c3c789740: Updates internal functions and tests to support blitz apps that run tests with vitest
- 240f378b5: Passes the correct arguments (without flags) to any bin command ran with the blitz cli
- df3265b85: blitz-rpc: Cleanup Event Listeners - Fix potential memory leak by cleaning up any residual event listeners set by blitz.
- 89bf993a1: add `db seed` cli command
- 3f9fe8f04: Exit CLI process after `blitz new` command is finished
- fe8c937d2: Remove rouge `console.log` during start
- 0ac6e1712: fixes blitz not loading custom server
- 807a2b564: Fixes peer dependency warnings
- 1d9804a61: Remove references to the logging package
- 41608c4c3: Run codegen tasks after creating a new app if user chose yarn as a package manager
- a0596279b: Fix blitz install for recipes that use the path helper to check if ./src/pages directory is available, otherwise use ./pages
- 88caa18e6: Patch next13 for suspense error
- 022392c12: - Updates `ts-log` peer dependency to `4.9.0`
  - Removes `javascript` from `blitz new` menu
  - Hot Fix the `Update Schema` when using blitz generator
- c126b8191: using "blitz install" inside recipe with addRunCommandStep causes hangs up
- c9cf7adc3: added index.cjs to blitz externals
- 1b798d9a0: Fix `useSession` hook by exporting `enhancePrisma` from the server entry point instead of server
- ea7561b8e: Multiple fields forms using templates during generation - TODO
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

- f39ba1ff1: Allow passing custom templates to the `blitz generate` command. Extend the `generate` command with `custom-templates` to provide an easy starting point for users to customize the default templates: `blitz generate custom-templates`.
- 161270e3b: Only run the prisma generate command when the schema file changes.
- b6b9a1c5a: Fix Next-Auth integration: `Unable to use next-auth with provider: Error [ERR_PACKAGE_PATH_NOT_EXPORTED]`
- 8bcb471a5: Fix auth issue where session token and publicData cookie were updated unnecessarily, leading to potential user logout

  - Previously, we were updating the session token each time public data changed. This is not needed, and it would cause race condition bugs where a user could be unexpectedly logged out because a request already in flight would not match the new session token.
  - Previously, we were updating the publicData cookie even when it hadn't changed. This may reduce unnecessary re-renders on the client.

- a3e6c49c4: Fixes the supports-color warning for pnpm
- 15d22af24: Add `blitz console` CLI command back to toolkit
- 454591293: Include resolvers in `src` directory in blitz console
- 2073714f8: testing set dist-tag
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

- b918055bf: Add aliases for Blitz CLI commands
- aa34661fa: Fix invalidateQuery generating wrong param when no param argument is passed
- 61888d1a3: Fix log formatting to not show the path of blitz rpc
- dd5f51744: Fix `enhancePrisma is undefined` errors by moving the utility function to a browser entrypoint
- ce4536833: init codemod generator
- fb32903bf: fix more cli problems
- b33db0828: Fix ambigious class warning log & upgrade superjson from 1.9.1 to 1.11.0
- f15a51901: various improvements and fixes
- 10f98c681: Add an href property to the generated route manifest that will return a string of the pathname and included query params.
- 9674efc0b: add @blitzjs/generator as external
- 8e0c9d76b: Migrate over recipe functionality from legacy framework & expose recipe builder helper functions that find and modify next.config.js, blitz-server & blitz-client.
- d5b8faa86: add regex to support inline and non-inline codebase and proper next.js package version check
- a3bbe6ce3: Fix routes manifest showing duplicates for non queries|resolvers reso…
- e2c18895d: Add client testing utilities and a sample test to a new blitz app template
- 00bd849ee: new app template
- ffa7b5ccc: During `blitz new` if project name argument is set to "." change it to current folder name
- 1f6b0b54c: fix generate cli command
- 527e48ac3: Fix running bin commands with Blitz CLI
- 01f3a03ea: remove console logs inside onPostInstall in the new cli command
- 2cc888eff: Beta release
- Updated dependencies [db7233db6]
- Updated dependencies [1569bd53e]
- Updated dependencies [cb63a0ea5]
- Updated dependencies [c5c727cb6]
- Updated dependencies [5166e5e03]
- Updated dependencies [047302055]
- Updated dependencies [1e1bb73b2]
- Updated dependencies [4656e6ecd]
- Updated dependencies [fd31e56bc]
- Updated dependencies [91aa53563]
- Updated dependencies [e228ba5de]
- Updated dependencies [1e0ec7a97]
- Updated dependencies [77b7da0f3]
- Updated dependencies [47c6b62dc]
- Updated dependencies [547613937]
- Updated dependencies [82649f341]
- Updated dependencies [8c247e26e]
- Updated dependencies [99205f52d]
- Updated dependencies [e3750b049]
- Updated dependencies [824a9b5e2]
- Updated dependencies [4603a2b7b]
- Updated dependencies [d6717b9d3]
- Updated dependencies [6ac2d3412]
- Updated dependencies [7498aef4f]
- Updated dependencies [2a81af7b7]
- Updated dependencies [ea7561b8e]
- Updated dependencies [176c7b8b5]
- Updated dependencies [8b4bf999c]
- Updated dependencies [1476a577b]
- Updated dependencies [b80c3d92c]
- Updated dependencies [b72d1215c]
- Updated dependencies [eb9715688]
- Updated dependencies [bf1b2c824]
- Updated dependencies [4cad9cca2]
- Updated dependencies [c89cb943b]
- Updated dependencies [bf4aaf1de]
- Updated dependencies [b43c1a81c]
- Updated dependencies [6ff9ec0d7]
- Updated dependencies [7aef610d8]
- Updated dependencies [c11f0401c]
- Updated dependencies [60de05747]
- Updated dependencies [ab4d9de70]
- Updated dependencies [8e5903c0f]
- Updated dependencies [6baab1907]
- Updated dependencies [8ada2c26f]
- Updated dependencies [4e26ae21b]
- Updated dependencies [430f0b52d]
- Updated dependencies [e339e2fd0]
- Updated dependencies [22344d058]
- Updated dependencies [81b4b41a9]
- Updated dependencies [d814c2d2d]
- Updated dependencies [46a34c7b3]
- Updated dependencies [e82a79be5]
- Updated dependencies [890b0c0c9]
- Updated dependencies [a961aff88]
- Updated dependencies [83281a846]
- Updated dependencies [6ec020c6d]
- Updated dependencies [adabb11a0]
- Updated dependencies [6d5f9efe1]
- Updated dependencies [b1ef45bf2]
- Updated dependencies [0f4926fd1]
- Updated dependencies [bcef81fad]
- Updated dependencies [8aee25c58]
- Updated dependencies [35a070ad7]
- Updated dependencies [8fa9a56f6]
- Updated dependencies [807a2b564]
- Updated dependencies [022392c12]
- Updated dependencies [ebd74b4e9]
- Updated dependencies [63605961b]
- Updated dependencies [c53978d58]
- Updated dependencies [17ce29e5e]
- Updated dependencies [ea7561b8e]
- Updated dependencies [a84b8de4e]
- Updated dependencies [70b334a2f]
- Updated dependencies [80e1ead7c]
- Updated dependencies [f39ba1ff1]
- Updated dependencies [b405c1e87]
- Updated dependencies [37623a4f4]
- Updated dependencies [dd299ae89]
- Updated dependencies [a3e6c49c4]
- Updated dependencies [b86b569d5]
- Updated dependencies [bd09db753]
- Updated dependencies [d316d0db7]
- Updated dependencies [12cb7a727]
- Updated dependencies [79c5e86d7]
- Updated dependencies [f15a51901]
- Updated dependencies [7abfb9086]
- Updated dependencies [e2c18895d]
- Updated dependencies [00bd849ee]
- Updated dependencies [065db256d]
- Updated dependencies [078fe4741]
- Updated dependencies [36e26193b]
- Updated dependencies [2cc888eff]
- Updated dependencies [8107138e2]
- Updated dependencies [f202aac18]
  - @blitzjs/generator@2.0.0

## 2.0.0-beta.37

### Patch Changes

- 86e8eb7c8: Add helpful error message when RPC resolvers have the same path
- b84c5bedb: Next 14 Compatibility
- Updated dependencies [6d5f9efe1]
  - @blitzjs/generator@2.0.0-beta.37

## 2.0.0-beta.36

### Patch Changes

- 09e0c68db: Automatically authorize role with usage of `redirectAuthenticatedTo` in `useAuthenticatedBlitzContext` utility
  - @blitzjs/generator@2.0.0-beta.36

## 2.0.0-beta.35

### Patch Changes

- cee2dec17: Fix bug that did not allow `Page.authenicate = {role: "" }` to correctly work
- aec1bb076: blitz-next: Fix `next/head` used in app directory warning
- b97366c42: Remove unintended dependency on next-auth by removing it from the core build of @blitzjs/auth

  ⚠️ Breaking Change for current users of `withNextAuthAdapter`

  Update your import in `next.config.js` in the following way

  ```diff
  -const { withNextAuthAdapter } = require("@blitzjs/auth")
  +const { withNextAuthAdapter } = require("@blitzjs/auth/next-auth")
  ```

- 3bcbad1a9: - Introduce Blitz RPC's logging system to the `invoke` function which is the recommended way to call resolvers in nextjs `app` directory's react server components.

  - This refactor also removes the re-introduced dependency between `blitz-auth` and `blitz-rpc`, allowing independent usage of `blitz-rpc`

- Updated dependencies [c89cb943b]
  - @blitzjs/generator@2.0.0-beta.35

## 2.0.0-beta.34

### Patch Changes

- 30fd61316: - Removes language selection step from `blitz new` menu
  - Make `formik` the default/recommended form library
- 3ddb57072: ⚠️ Breaking Change:
  Next.js version 13.5 or above is now required to use `@blitzjs/next`

  Fix `Error: Cannot find module 'next/dist/shared/lib/router/utils/resolve-href'` by updating the location of next.js internal function.

- fe8c937d2: Remove rouge `console.log` during start
  - @blitzjs/generator@2.0.0-beta.34

## 2.0.0-beta.33

### Patch Changes

- 19898a488: Fix for tslog error `TypeError: Cannot read properties of undefined (reading 'map')` while using custom errors.
- 6811eab1a: Allow `.tsx` & `.jsx` file extensions to be used for resolvers
- 022392c12: - Updates `ts-log` peer dependency to `4.9.0`
  - Removes `javascript` from `blitz new` menu
  - Hot Fix the `Update Schema` when using blitz generator
- Updated dependencies [022392c12]
  - @blitzjs/generator@2.0.0-beta.33

## 2.0.0-beta.32

### Patch Changes

- 82649f341: Upgrade tslog to `4.9.0`.

  This due a [tslog issue](https://github.com/fullstack-build/tslog/issues/227) that causes tslog to crash when attempting to log an error whose constructor expects more than one argument.

- Updated dependencies [47c6b62dc]
- Updated dependencies [82649f341]
  - @blitzjs/generator@2.0.0-beta.32

## 2.0.0-beta.31

### Patch Changes

- 90f1741da: blitz-auth: Support for Prisma v5

  Internal: Make `handle` a required paramter while updating the `session` modal.

- df3265b85: blitz-rpc: Cleanup Event Listeners - Fix potential memory leak by cleaning up any residual event listeners set by blitz.
  - @blitzjs/generator@2.0.0-beta.31

## 2.0.0-beta.30

### Patch Changes

- c5572bec6: blitz-auth: Fix webpack from following next-auth
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

  - @blitzjs/generator@2.0.0-beta.30

## 2.0.0-beta.29

### Patch Changes

- b6b9a1c5a: Fix Next-Auth integration: `Unable to use next-auth with provider: Error [ERR_PACKAGE_PATH_NOT_EXPORTED]`
- 61888d1a3: Fix log formatting to not show the path of blitz rpc
- Updated dependencies [7aef610d8]
  - @blitzjs/generator@2.0.0-beta.29

## 2.0.0-beta.28

### Patch Changes

- 5166e5e03: (feat) upgrade tslog to v4.8.2
- Updated dependencies [5166e5e03]
  - @blitzjs/generator@2.0.0-beta.28

## 2.0.0-beta.27

### Patch Changes

- Updated dependencies [d814c2d2d]
  - @blitzjs/generator@2.0.0-beta.27

## 2.0.0-beta.26

### Patch Changes

- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- 38d945a3f: The issue is that the version provided, "13.2", is not a valid SemVer version. A valid SemVer version must have three components: major, minor, and patch (e.g., "13.2.0").
- Updated dependencies [e82a79be5]
  - @blitzjs/generator@2.0.0-beta.26

## 2.0.0-beta.25

### Patch Changes

- @blitzjs/generator@2.0.0-beta.25

## 2.0.0-beta.24

### Minor Changes

- cadefb88e: - New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
  - New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
  - New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
  - Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps
- 6f18cbdc9: feature: Next Auth Adapter

### Patch Changes

- ea7561b8e: Consolidate mutations schema to new schema.{ts|js} file.
- ea7561b8e: Multiple fields forms using templates during generation - TODO
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

- Updated dependencies [e228ba5de]
- Updated dependencies [ea7561b8e]
- Updated dependencies [430f0b52d]
- Updated dependencies [ea7561b8e]
  - @blitzjs/generator@2.0.0-beta.24

## 2.0.0-beta.23

### Patch Changes

- c3c789740: Updates internal functions and tests to support blitz apps that run tests with vitest
- Updated dependencies [cb63a0ea5]
- Updated dependencies [6ec020c6d]
- Updated dependencies [d316d0db7]
- Updated dependencies [79c5e86d7]
  - @blitzjs/generator@2.0.0-beta.23

## 2.0.0-beta.22

### Minor Changes

- 8aa22a0b2: add `currentPassword` to the default fields that are masked in the logger

### Patch Changes

- 989691ec8: Use `src` instead of `app` folder for `blitz generate custom-template`
- Updated dependencies [bcef81fad]
- Updated dependencies [7abfb9086]
  - @blitzjs/generator@2.0.0-beta.22

## 2.0.0-beta.21

### Patch Changes

- d692b4c1d: Fix suspense error codegen patch for nextjs versions 13-13.0.6
- 10f98c681: Add an href property to the generated route manifest that will return a string of the pathname and included query params.
- d5b8faa86: add regex to support inline and non-inline codebase and proper next.js package version check
- Updated dependencies [77b7da0f3]
  - @blitzjs/generator@2.0.0-beta.21

## 2.0.0-beta.20

### Minor Changes

- 74a14b70: When db.\$reset() rejects, reject with an Error object
- 6ece0961: Decoupled Blitz RPC from Blitz Auth to allow independent use.

### Patch Changes

- a0596279: Fix blitz install for recipes that use the path helper to check if ./src/pages directory is available, otherwise use ./pages
- Updated dependencies [8c247e26]
  - @blitzjs/generator@2.0.0-beta.20

## 2.0.0-beta.19

### Major Changes

- 942536d9: update paginate.ts, return more params for more complex pagination control

### Minor Changes

- c1e00406: transpile packages to es2015 to support older browsers
- 696f48c4: some providers need extra attributes, update for wrapAppWithProvider

### Patch Changes

- a6f32d1d: Export enhancePrisma for client again (Fixes #3964)
- c126b819: using "blitz install" inside recipe with addRunCommandStep causes hangs up
- b33db082: Fix ambigious class warning log & upgrade superjson from 1.9.1 to 1.11.0
- Updated dependencies [b80c3d92]
  - @blitzjs/generator@2.0.0-beta.19

## 2.0.0-beta.18

### Patch Changes

- @blitzjs/generator@2.0.0-beta.18

## 2.0.0-beta.17

### Patch Changes

- 5ea068b2: Check if blitz-server & blitz-client is located in either the app or src directory and return the correct path for blitz recipes.
- 8b4bf999: Update dependencies
- 88caa18e: Patch next13 for suspense error
- Updated dependencies [2a81af7b]
- Updated dependencies [8b4bf999]
  - @blitzjs/generator@2.0.0-beta.17

## 2.0.0-beta.16

### Patch Changes

- 1569bd53: Upgrade `tslog` to the latest version
- ceb7db27: Add an opt-in GET request support to RPC specification by exporting a `config` object that has the `httpMethod` property.
  from `query` files.
- 8e5903c0: Fix `cannot find module db error` in JavaScript template. Replace requiring the config using `esbuild` with parsing using `jscodeshift` to get the `cliConfig` values. Added logic to find the `blitz-server` file in `src` directory
- 45459129: Include resolvers in `src` directory in blitz console
- Updated dependencies [1569bd53]
- Updated dependencies [8e5903c0]
  - @blitzjs/generator@2.0.0-beta.16

## 2.0.0-beta.15

### Patch Changes

- 1b798d9a: Fix `useSession` hook by exporting `enhancePrisma` from the server entry point instead of server
  - @blitzjs/generator@2.0.0-beta.15

## 2.0.0-beta.14

### Patch Changes

- 78fd5c48: Fix Blitz Install issue that gets stuck on "Generating file diff"
- 0a8b0cb3: Fix Custom Server TS error - add `es6` target config to esbuild
- Updated dependencies [54761393]
- Updated dependencies [60de0574]
  - @blitzjs/generator@2.0.0-beta.14

## 2.0.0-beta.13

### Patch Changes

- a6e81f15: Add BlitzLogger plugin and allow customizing logging
- 6f434989: Fix "Ambiguous class detected" errors reported by SuperJson by removing duplicated export from errors.ts file
- Updated dependencies [4e26ae21]
  - @blitzjs/generator@2.0.0-beta.13

## 2.0.0-beta.12

### Patch Changes

- 3a602b61: Fix `blitz install` not working due to missing `blitz/installer` dependency
- f39ba1ff: Allow passing custom templates to the `blitz generate` command. Extend the `generate` command with `custom-templates` to provide an easy starting point for users to customize the default templates: `blitz generate custom-templates`.
- Updated dependencies [f39ba1ff]
  - @blitzjs/generator@2.0.0-beta.12

## 2.0.0-beta.11

### Patch Changes

- 1476a577: Fix release
- Updated dependencies [1476a577]
  - @blitzjs/generator@2.0.0-beta.11

## 2.0.0-beta.5

### Patch Changes

- 9db6c885: Fix `blitz --help` CLI command not being found
- d98e4bac: Add `blitz routes` CLI command back to toolkit
- 9fe0cc54: Fix auth related React hydration errors by not redirecting until after component mount.
- af58e2b2: Add a global Blitz version check when generating a new Blitz project to ensure users use the latest Blitz.
- 2ade7268: Add `blitz export` CLI command to toolkit
- 0edeaa37: Allow for custom page extensions for the wildcard blitz route. For example [...blitz].api.ts. For more information vist https://nextjs.org/docs/api-reference/next.config.js/custom-page-extensions
- 430f6ec7: Only generate the prisma client if it's not found in node_modules when running a blitz cli command.
- 15d22af2: Add `blitz console` CLI command back to toolkit
- aa34661f: Fix invalidateQuery generating wrong param when no param argument is passed
- 8e0c9d76: Migrate over recipe functionality from legacy framework & expose recipe builder helper functions that find and modify next.config.js, blitz-server & blitz-client.
- e2c18895: Add client testing utilities and a sample test to a new blitz app template
- Updated dependencies [04730205]
- Updated dependencies [824a9b5e]
- Updated dependencies [d6717b9d]
- Updated dependencies [bf4aaf1d]
- Updated dependencies [b43c1a81]
- Updated dependencies [83281a84]
- Updated dependencies [bd09db75]
- Updated dependencies [e2c18895]
  - @blitzjs/generator@2.0.0-beta.10

## 2.0.0-beta.4

### Patch Changes

- c213d521: Fix issue with the route name that's generated for nested routes in @blitzjs/rpc. This was causing issues for windows users.
- 0b94a450: Upgrade superjson to the latest version
- 161270e3: Only run the prisma generate command when the schema file changes.
- Updated dependencies [7498aef4]
- Updated dependencies [22344d05]
- Updated dependencies [8fa9a56f]
- Updated dependencies [c53978d5]
- Updated dependencies [a84b8de4]
  - @blitzjs/generator@2.0.0-beta.4

## 2.0.0-beta.3

### Patch Changes

- 638f2319: Prevent `Minified react error #419` in production
- Updated dependencies [b72d1215]
  - @blitzjs/generator@2.0.0-beta.3

## 2.0.0-beta.2

### Patch Changes

- db7233db: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- 0936cb38: Patch Next.js Suspense issue in all node environments. Previously we only patched it in the `development` environment, but now we make sure it gets patched in the `production` env (with the `blitz build` command) as well.
- 3f9fe8f0: Exit CLI process after `blitz new` command is finished
- Updated dependencies [db7233db]
- Updated dependencies [eb971568]
- Updated dependencies [8ada2c26]
  - @blitzjs/generator@2.0.0-beta.2

## 2.0.0-beta.1

### Patch Changes

- Updated dependencies [0f4926fd]
  - @blitzjs/generator@2.0.0-beta.1

## 2.0.0-beta.72

### Patch Changes

- 2cc888ef: Beta release
- Updated dependencies [2cc888ef]
  - @blitzjs/generator@2.0.0-beta.72

## 2.0.0-alpha.71

### Patch Changes

- Updated dependencies [176c7b8b]
  - @blitzjs/generator@2.0.0-alpha.71

## 2.0.0-alpha.70

### Patch Changes

- Updated dependencies [4656e6ec]
- Updated dependencies [1e0ec7a9]
  - @blitzjs/generator@2.0.0-alpha.70

## 2.0.0-alpha.69

### Patch Changes

- fd31e56b: Add back blitz generate command
- Updated dependencies [fd31e56b]
- Updated dependencies [6baab190]
- Updated dependencies [37623a4f]
  - @blitzjs/generator@2.0.0-alpha.69

## 2.0.0-alpha.68

### Patch Changes

- 271c58ac: Comment out generate command import until we add the full support back
- 630c7181: Use internal branded blitz logger for @blitzjs/rpc
- f0ca738d: Run codegen tasks on blitz dev command
- 41608c4c: Run codegen tasks after creating a new app if user chose yarn as a package manager
- Updated dependencies [70b334a2]
- Updated dependencies [dd299ae8]
- Updated dependencies [078fe474]
  - @blitzjs/generator@2.0.0-alpha.68

## 2.0.0-alpha.67

### Patch Changes

- Updated dependencies [ebd74b4e]
  - @blitzjs/generator@2.0.0-alpha.67

## 2.0.0-alpha.66

### Patch Changes

- 928e840b: Fixes loading production env variables by default for blitz build command
- 240f3f34: Add BlitzServerMiddleware utility function to wrap middleware in blitz server file
- 55b1cb20: Runs the codegen on the blitz build command
- 4d7d126d: Run `prisma generate` as a `blitz codegen` step if "prisma" is found in project's dependencies
- 890b0c0c: Improve `blitz new` messaging and fix minor issues
- 807a2b56: Fixes peer dependency warnings
- a3e6c49c: Fixes the supports-color warning for pnpm
- Updated dependencies [91aa5356]
- Updated dependencies [890b0c0c]
- Updated dependencies [807a2b56]
- Updated dependencies [a3e6c49c]
- Updated dependencies [065db256]
- Updated dependencies [f202aac1]
  - @blitzjs/generator@2.0.0-alpha.66

## 2.0.0-alpha.65

### Patch Changes

- dd5f5174: Fix `enhancePrisma is undefined` errors by moving the utility function to a browser entrypoint
  - @blitzjs/generator@2.0.0-alpha.65

## 2.0.0-alpha.64

### Patch Changes

- 54db8a46: Add missing value to "skip" option when choosing a package manager during new app scaffolding
- 62bf12b5: Fix blitz codegen to work with monorepos
  - @blitzjs/generator@2.0.0-alpha.64

## 2.0.0-alpha.63

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.63

## 2.0.0-alpha.62

### Patch Changes

- 365e6709: Fixes the db seed command so that the database can disconnect after running the seed file.
  - @blitzjs/generator@2.0.0-alpha.62

## 2.0.0-alpha.61

### Patch Changes

- 240f378b: Passes the correct arguments (without flags) to any bin command ran with the blitz cli
  - @blitzjs/generator@2.0.0-alpha.61

## 2.0.0-alpha.60

### Patch Changes

- 1d863f35: Fix APP_ENV not being set before loading env config
  - @blitzjs/generator@2.0.0-alpha.60

## 2.0.0-alpha.59

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.59

## 2.0.0-alpha.58

### Minor Changes

- 83b35590: Truncate errors from `api/auth/<strategy>/callback` request to 100 characters before passing them to the `?authError=` query parameter

### Patch Changes

- Updated dependencies [e339e2fd]
  - @blitzjs/generator@2.0.0-alpha.58

## 2.0.0-alpha.57

### Patch Changes

- 3511d5b6: Temporarily skip version check
  - @blitzjs/generator@2.0.0-alpha.57

## 2.0.0-alpha.56

### Patch Changes

- abb1ad5d: Improve codemod utilities
- abe2afcc: Fix a long-standing issue with occasional blitz auth flakiness

  This bug would sometimes cause users to be logged out or to experience an CSRFTokenMismatchError. This bug, when encountered, usually by lots of setPublicData or session.create calls, would not set the cookie headers correctly resulting in cookies being set to a previous state or in a possibly undefined state.

  There are no security concerns as far as I can tell.

- 0ac6e171: fixes blitz not loading custom server
- 8bcb471a: Fix auth issue where session token and publicData cookie were updated unnecessarily, leading to potential user logout

  - Previously, we were updating the session token each time public data changed. This is not needed, and it would cause race condition bugs where a user could be unexpectedly logged out because a request already in flight would not match the new session token.
  - Previously, we were updating the publicData cookie even when it hadn't changed. This may reduce unnecessary re-renders on the client.
  - @blitzjs/generator@2.0.0-alpha.56

## 2.0.0-alpha.55

### Patch Changes

- 8f166a5d: Check for new versions when running CLI
- 54a66a95: Show all blitz packages when running `blitz version` command
- Updated dependencies [ab4d9de7]
  - @blitzjs/generator@2.0.0-alpha.55

## 2.0.0-alpha.54

### Patch Changes

- f397cc20: Fixes issue when generating a new blitz app with the form flag that ends up installing the wrong form library
- cacb65d6: Fixes wrong import of the db module in `blitz db seed` command function
- 348fd6f5: Fix redirectAuthenticatedTo errors
- 20fc9f80: Fix SSP / SP not prefetching queries correctly
- a3bbe6ce: Fix routes manifest showing duplicates for non queries|resolvers reso…
- ffa7b5cc: During `blitz new` if project name argument is set to "." change it to current folder name
- Updated dependencies [a961aff8]
- Updated dependencies [80e1ead7]
  - @blitzjs/generator@2.0.0-alpha.54

## 2.0.0-alpha.53

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.53

## 2.0.0-alpha.52

### Patch Changes

- Updated dependencies [12cb7a72]
  - @blitzjs/generator@2.0.0-alpha.52

## 2.0.0-alpha.51

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.51

## 2.0.0-alpha.50

### Patch Changes

- Updated dependencies [c11f0401]
  - @blitzjs/generator@2.0.0-alpha.50

## 2.0.0-alpha.49

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.49

## 2.0.0-alpha.48

### Patch Changes

- 93851d90: Handle duplicate imports with Blitz upgrade-legacy codemod
  - @blitzjs/generator@2.0.0-alpha.48

## 2.0.0-alpha.47

### Patch Changes

- 1d9804a6: Remove references to the logging package
- Updated dependencies [b405c1e8]
- Updated dependencies [b86b569d]
  - @blitzjs/generator@2.0.0-alpha.47

## 2.0.0-alpha.46

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.46

## 2.0.0-alpha.45

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.45

## 2.0.0-alpha.44

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.44

## 2.0.0-alpha.43

### Patch Changes

- 527e48ac: Fix running bin commands with Blitz CLI
  - @blitzjs/generator@2.0.0-alpha.43

## 2.0.0-alpha.42

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.42

## 2.0.0-alpha.41

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.41

## 2.0.0-alpha.40

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.40

## 2.0.0-alpha.39

### Patch Changes

- b918055b: Add aliases for Blitz CLI commands
  - @blitzjs/generator@2.0.0-alpha.39

## 2.0.0-alpha.38

### Patch Changes

- Updated dependencies [8aee25c5]
  - @blitzjs/generator@2.0.0-alpha.38

## 2.0.0-alpha.37

### Patch Changes

- a80d2a8f: rename middleware type for blitz server plugin
  - @blitzjs/generator@2.0.0-alpha.37

## 2.0.0-alpha.36

### Patch Changes

- Updated dependencies [4cad9cca]
  - @blitzjs/generator@2.0.0-alpha.36

## 2.0.0-alpha.35

### Patch Changes

- Updated dependencies [e3750b04]
  - @blitzjs/generator@2.0.0-alpha.35

## 2.0.0-alpha.34

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.34

## 2.0.0-alpha.33

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.33

## 2.0.0-alpha.32

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.32

## 2.0.0-alpha.31

### Patch Changes

- Updated dependencies [17ce29e5]
  - @blitzjs/generator@2.0.0-alpha.31

## 2.0.0-alpha.30

### Patch Changes

- ce453683: init codemod generator
  - @blitzjs/generator@2.0.0-alpha.30

## 2.0.0-alpha.29

### Patch Changes

- 962eb58a: detailed print env info
  - @blitzjs/generator@2.0.0-alpha.29

## 2.0.0-alpha.28

### Patch Changes

- Updated dependencies [6ac2d341]
  - @blitzjs/generator@2.0.0-alpha.28

## 2.0.0-alpha.27

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.27

## 2.0.0-alpha.26

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.26

## 2.0.0-alpha.25

### Patch Changes

- 1436e761: Export Zod utils from blitz core package
  - @blitzjs/generator@2.0.0-alpha.25

## 2.0.0-alpha.24

### Patch Changes

- 8490b072: test automated publish
  - @blitzjs/generator@2.0.0-alpha.24

## 2.0.0-alpha.23

### Patch Changes

- various improvements and fixes
- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.23

## 2.0.0-alpha.22

### Patch Changes

- - Add mounted check to withBlitz
  - Upgrade @types/react, fix typings inside @blitzjs/next
  - Support prefetchBlitzQuery in gSP and gSSP
  - Add db seed cli command
  - Add try/catch to changePassword mutation
- 89bf993a: add `db seed` cli command
- Updated dependencies [c5c727cb]
- Updated dependencies [6ff9ec0d]
- Updated dependencies [81b4b41a]
- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.22

## 2.0.0-alpha.21

### Patch Changes

- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.21

## 2.0.0-alpha.20

### Patch Changes

- testing set dist-tag
  - @blitzjs/generator@2.0.0-alpha.20

## 2.0.0-alpha.19

### Patch Changes

- Updated dependencies [63605961]
  - @blitzjs/generator@2.0.0-alpha.19

## 2.0.0-alpha.18

### Patch Changes

- fix generate cli command
  - @blitzjs/generator@2.0.0-alpha.18

## 2.0.0-alpha.17

### Patch Changes

- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.17

## 2.0.0-alpha.16

### Patch Changes

- remove console logs inside onPostInstall in the new cli command
  - @blitzjs/generator@2.0.0-alpha.16

## 2.0.0-alpha.15

### Patch Changes

- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.15

## 2.0.0-alpha.14

### Patch Changes

- set default enviornment variable to development unless build and start command
  - @blitzjs/generator@2.0.0-alpha.14

## 2.0.0-alpha.13

### Patch Changes

- Fix codegen and postinstall to make work with pnpm
- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.13

## 2.0.0-alpha.12

### Patch Changes

- Use alpha version for blitz dependency, fix package manager selection
- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.12

## 2.0.0-alpha.11

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.11

## 2.0.0-alpha.10

### Patch Changes

- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.10

## 2.0.0-alpha.9

### Patch Changes

- add @blitzjs/generator as external
  - @blitzjs/generator@2.0.0-alpha.9

## 2.0.0-alpha.8

### Patch Changes

- fix broken cli versioning
  - @blitzjs/generator@2.0.0-alpha.8

## 2.0.0-alpha.7

### Patch Changes

- added index.cjs to blitz externals
  - @blitzjs/generator@2.0.0-alpha.7

## 2.0.0-alpha.6

### Patch Changes

- fix route manifest codegen
- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.6

## 2.0.0-alpha.5

### Patch Changes

- new app template
- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.5

## 2.0.0-alpha.4

### Patch Changes

- fix more cli problems
  - @blitzjs/generator@2.0.0-alpha.4

## 2.0.0-alpha.3

### Patch Changes

- downgrade pkg-dir to non-esm only version
  - @blitzjs/generator@2.0.0-alpha.3

## 2.0.0-alpha.2

### Patch Changes

- Updated dependencies
  - @blitzjs/generator@2.0.0-alpha.2

## 2.0.0-alpha.1

### Patch Changes

- 46a34c7b: initial publish
- Updated dependencies [46a34c7b]
  - @blitzjs/generator@2.0.0-alpha.1
