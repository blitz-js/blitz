# @blitzjs/auth

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

- 318e9740d: feat: support next-auth version 4.24.7
- Updated dependencies [318e9740d]
  - blitz@2.0.10

## 2.0.9

### Patch Changes

- Updated dependencies [5a14306f7]
  - blitz@2.0.9

## 2.0.8

### Patch Changes

- 77555468f: fix: add missing host while initialising the next-auth adapter
- Updated dependencies [5e61a1681]
- Updated dependencies [77555468f]
  - blitz@2.0.8

## 2.0.7

### Patch Changes

- Updated dependencies [ee7bf87ec]
- Updated dependencies [178c152b2]
  - blitz@2.0.7

## 2.0.6

### Patch Changes

- 5a587a6c3: Fix bundling issue that occurs in vercel due to the way imports were handled internally
- Updated dependencies [76a2544f9]
  - blitz@2.0.6

## 2.0.5

### Patch Changes

- 6f54841b7: fix: getBlitzContext() can only be used in React Server Components in Nextjs 13 or higher
- 8a417533f: fix: remove restriction to use `secure` cookies in localhost / during development following spec in [developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
- Updated dependencies [6f54841b7]
  - blitz@2.0.5

## 2.0.4

### Patch Changes

- dd604c767: perf: add filter to select only non expired sessions
- Updated dependencies [dd604c767]
- Updated dependencies [28a79040e]
  - blitz@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [2f5c8a3a0]
  - blitz@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies [e8fd12e4f]
  - blitz@2.0.2

## 2.0.1

### Patch Changes

- 8782aae64: Fix outdated code in npm caused in during exit to stable release
- Updated dependencies [8782aae64]
  - blitz@2.0.1

## 2.0.0

### Major Changes

- 9529dbd6f: ## ⚠️ Breaking Changes for Blitz Auth

  Automatically upgrade using codemod
  (Make sure to git commit before running this command to avoid losing changes)

  ```bash
  npx @blitz/codemod secure-password
  ```

  Introduce a new import path for the Blitz wrapper `SecurePassword` to fully decouple the library from `@blitzjs/auth`

  ```diff
  - import {SecurePassword} from "@blitzjs/auth"
  + import {SecurePassword} from "@blitzjs/auth/secure-password"
  ```

- 42a2cf951: BREAKING CHANGE: secure-password is now an `optional peerDependency`, if you are using `SecurePassword` api, you need to now install `secure-password` in your application.

  This helps users who do not use SecurePassword from having native package build issues.

### Minor Changes

- c1e004063: transpile packages to es2015 to support older browsers
- cadefb88e: - New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
  - New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
  - New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
  - Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps
- 6ece09613: Decoupled Blitz RPC from Blitz Auth to allow independent use.
- 6f18cbdc9: feature: Next Auth Adapter
- 55a43ce1f: maybe fix anon session CSRF issue + add ability to customize anon session expiry time
- 03bad3175: fix Cannot read properties of null (reading 'isReady') for pnpm/yarn v3
- 1bb3a6556: Stop exporting `useAuthenticatedBlitzContext` from `@blitzjs/auth` this must be imported from `app/blitz-server.ts` file in order to work correctly
- 145d5a02b: fix failed localStorage access to not crash the application

### Patch Changes

- db7233db6: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- cee2dec17: Fix bug that did not allow `Page.authenicate = {role: "" }` to correctly work
- 5166e5e03: (feat) upgrade tslog to v4.8.2
- 83b355900: Truncate errors from `api/auth/<strategy>/callback` request to 100 characters before passing them to the `?authError=` query parameter
- c5572bec6: blitz-auth: Fix webpack from following next-auth
- 3f20a4740: Update `deleteSession` return type — allow undefined values
- 82e8b64f5: Fixes adding authError query param in Passport adapter.
- 90f1741da: blitz-auth: Support for Prisma v5

  Internal: Make `handle` a required paramter while updating the `session` modal.

- 7817fe3a8: Add missing RouteUrlObject on Page.authenticate.redirectTo
- 8b01175b4: Updated `useAuthenticatedBlitzContext` to now return `AuthenticatedCtx`
- 8b4bf999c: Update dependencies
- 1476a577b: Fix release
- bf1b2c824: fix route manifest codegen
- 9fe0cc546: Fix auth related React hydration errors by not redirecting until after component mount.
- 09e0c68db: Automatically authorize role with usage of `redirectAuthenticatedTo` in `useAuthenticatedBlitzContext` utility
- a80d2a8f7: rename middleware type for blitz server plugin
- 3ddb57072: ⚠️ Breaking Change:
  Next.js version 13.5 or above is now required to use `@blitzjs/next`

  Fix `Error: Cannot find module 'next/dist/shared/lib/router/utils/resolve-href'` by updating the location of next.js internal function.

- abe2afccd: Fix a long-standing issue with occasional blitz auth flakiness

  This bug would sometimes cause users to be logged out or to experience an CSRFTokenMismatchError. This bug, when encountered, usually by lots of setPublicData or session.create calls, would not set the cookie headers correctly resulting in cookies being set to a previous state or in a possibly undefined state.

  There are no security concerns as far as I can tell.

- b84c5bedb: Next 14 Compatibility
- b97366c42: Remove unintended dependency on next-auth by removing it from the core build of @blitzjs/auth

  ⚠️ Breaking Change for current users of `withNextAuthAdapter`

  Update your import in `next.config.js` in the following way

  ```diff
  -const { withNextAuthAdapter } = require("@blitzjs/auth")
  +const { withNextAuthAdapter } = require("@blitzjs/auth/next-auth")
  ```

- 3bcbad1a9: - Introduce Blitz RPC's logging system to the `invoke` function which is the recommended way to call resolvers in nextjs `app` directory's react server components.

  - This refactor also removes the re-introduced dependency between `blitz-auth` and `blitz-rpc`, allowing independent usage of `blitz-rpc`

- 46a34c7b3: initial publish
- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- 0f4926fd1: Set current Blitz tag to latest
- 97469a126: Added option `role` to `authenticate` property of `BlitzPage` to authenticate page with respect to the role of the user. `String` value or `Array` of strings can be passed to authorize users.
- 1d9804a61: Remove references to the logging package
- b6b9a1c5a: Fix Next-Auth integration: `Unable to use next-auth with provider: Error [ERR_PACKAGE_PATH_NOT_EXPORTED]`
- 1436e7618: Add passport adapter to @blitzjs/auth
- 1c809094f: Fix `Page.authenticate` not working for layout components
- 8bcb471a5: Fix auth issue where session token and publicData cookie were updated unnecessarily, leading to potential user logout

  - Previously, we were updating the session token each time public data changed. This is not needed, and it would cause race condition bugs where a user could be unexpectedly logged out because a request already in flight would not match the new session token.
  - Previously, we were updating the publicData cookie even when it hadn't changed. This may reduce unnecessary re-renders on the client.

- a3e6c49c4: Fixes the supports-color warning for pnpm
- 6e88a847f: Fixed security vulnerabilities in passport-adapter by upgrading `passport` and `jsonwebtoken`
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

- 00bd849ee: new app template
- 2cc888eff: Beta release
- 29c2b029a: Fix: Add missing entry to expose next-auth adapter in Blitz Auth
- 713aead93: Allow specifying custom strategy name in Blitz's passport adapter
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

### Patch Changes

- b84c5bedb: Next 14 Compatibility
- Updated dependencies [86e8eb7c8]
- Updated dependencies [b84c5bedb]
  - blitz@2.0.0-beta.37

## 2.0.0-beta.36

### Patch Changes

- 09e0c68db: Automatically authorize role with usage of `redirectAuthenticatedTo` in `useAuthenticatedBlitzContext` utility
- Updated dependencies [09e0c68db]
  - blitz@2.0.0-beta.36

## 2.0.0-beta.35

### Patch Changes

- cee2dec17: Fix bug that did not allow `Page.authenicate = {role: "" }` to correctly work
- b97366c42: Remove unintended dependency on next-auth by removing it from the core build of @blitzjs/auth

  ⚠️ Breaking Change for current users of `withNextAuthAdapter`

  Update your import in `next.config.js` in the following way

  ```diff
  -const { withNextAuthAdapter } = require("@blitzjs/auth")
  +const { withNextAuthAdapter } = require("@blitzjs/auth/next-auth")
  ```

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

- Updated dependencies [19898a488]
- Updated dependencies [6811eab1a]
- Updated dependencies [022392c12]
  - blitz@2.0.0-beta.33

## 2.0.0-beta.32

### Patch Changes

- 8b01175b4: Updated `useAuthenticatedBlitzContext` to now return `AuthenticatedCtx`
- Updated dependencies [82649f341]
  - blitz@2.0.0-beta.32

## 2.0.0-beta.31

### Patch Changes

- 90f1741da: blitz-auth: Support for Prisma v5

  Internal: Make `handle` a required paramter while updating the `session` modal.

- Updated dependencies [90f1741da]
- Updated dependencies [df3265b85]
  - blitz@2.0.0-beta.31

## 2.0.0-beta.30

### Patch Changes

- c5572bec6: blitz-auth: Fix webpack from following next-auth
- Updated dependencies [c5572bec6]
- Updated dependencies [727734955]
  - blitz@2.0.0-beta.30

## 2.0.0-beta.29

### Patch Changes

- b6b9a1c5a: Fix Next-Auth integration: `Unable to use next-auth with provider: Error [ERR_PACKAGE_PATH_NOT_EXPORTED]`
- Updated dependencies [b6b9a1c5a]
- Updated dependencies [61888d1a3]
  - blitz@2.0.0-beta.29

## 2.0.0-beta.28

### Minor Changes

- 1bb3a6556: Stop exporting `useAuthenticatedBlitzContext` from `@blitzjs/auth` this must be imported from `app/blitz-server.ts` file in order to work correctly

### Patch Changes

- 5166e5e03: (feat) upgrade tslog to v4.8.2
- Updated dependencies [5166e5e03]
  - blitz@2.0.0-beta.28

## 2.0.0-beta.27

### Patch Changes

- 29c2b029a: Fix: Add missing entry to expose next-auth adapter in Blitz Auth
  - blitz@2.0.0-beta.27

## 2.0.0-beta.26

### Patch Changes

- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- Updated dependencies [e82a79be5]
- Updated dependencies [38d945a3f]
  - blitz@2.0.0-beta.26

## 2.0.0-beta.25

### Patch Changes

- blitz@2.0.0-beta.25

## 2.0.0-beta.24

### Major Changes

- 9529dbd6f: ## ⚠️ Breaking Changes for Blitz Auth

  Automatically upgrade using codemod
  (Make sure to git commit before running this command to avoid losing changes)

  ```bash
  npx @blitz/codemod secure-password
  ```

  Introduce a new import path for the Blitz wrapper `SecurePassword` to fully decouple the library from `@blitzjs/auth`

  ```diff
  - import {SecurePassword} from "@blitzjs/auth"
  + import {SecurePassword} from "@blitzjs/auth/secure-password"
  ```

### Minor Changes

- cadefb88e: - New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
  - New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
  - New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
  - Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps
- 6f18cbdc9: feature: Next Auth Adapter

### Patch Changes

- 6e88a847f: Fixed security vulnerabilities in passport-adapter by upgrading `passport` and `jsonwebtoken`
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

### Major Changes

- 42a2cf951: BREAKING CHANGE: secure-password is now an `optional peerDependency`, if you are using `SecurePassword` api, you need to now install `secure-password` in your application.

  This helps users who do not use SecurePassword from having native package build issues.

### Patch Changes

- Updated dependencies [c3c789740]
  - blitz@2.0.0-beta.23

## 2.0.0-beta.22

### Minor Changes

- 145d5a02b: fix failed localStorage access to not crash the application

### Patch Changes

- Updated dependencies [989691ec8]
- Updated dependencies [8aa22a0b2]
  - blitz@2.0.0-beta.22

## 2.0.0-beta.21

### Patch Changes

- 82e8b64f5: Fixes adding authError query param in Passport adapter.
- Updated dependencies [d692b4c1d]
- Updated dependencies [10f98c681]
- Updated dependencies [d5b8faa86]
  - blitz@2.0.0-beta.21

## 2.0.0-beta.20

### Minor Changes

- 6ece0961: Decoupled Blitz RPC from Blitz Auth to allow independent use.
- 03bad317: fix Cannot read properties of null (reading 'isReady') for pnpm/yarn v3

### Patch Changes

- Updated dependencies [74a14b70]
- Updated dependencies [6ece0961]
- Updated dependencies [a0596279]
  - blitz@2.0.0-beta.20

## 2.0.0-beta.19

### Minor Changes

- c1e00406: transpile packages to es2015 to support older browsers

### Patch Changes

- Updated dependencies [c1e00406]
- Updated dependencies [696f48c4]
- Updated dependencies [942536d9]
- Updated dependencies [a6f32d1d]
- Updated dependencies [c126b819]
- Updated dependencies [b33db082]
  - blitz@2.0.0-beta.19

## 2.0.0-beta.18

### Patch Changes

- blitz@2.0.0-beta.18

## 2.0.0-beta.17

### Patch Changes

- 8b4bf999: Update dependencies
- 97469a12: Added option `role` to `authenticate` property of `BlitzPage` to authenticate page with respect to the role of the user. `String` value or `Array` of strings can be passed to authorize users.
- Updated dependencies [5ea068b2]
- Updated dependencies [8b4bf999]
- Updated dependencies [88caa18e]
  - blitz@2.0.0-beta.17

## 2.0.0-beta.16

### Minor Changes

- 55a43ce1: maybe fix anon session CSRF issue + add ability to customize anon session expiry time

### Patch Changes

- Updated dependencies [1569bd53]
- Updated dependencies [ceb7db27]
- Updated dependencies [8e5903c0]
- Updated dependencies [45459129]
  - blitz@2.0.0-beta.16

## 2.0.0-beta.15

### Patch Changes

- Updated dependencies [1b798d9a]
  - blitz@2.0.0-beta.15

## 2.0.0-beta.14

### Patch Changes

- Updated dependencies [78fd5c48]
- Updated dependencies [0a8b0cb3]
  - blitz@2.0.0-beta.14

## 2.0.0-beta.13

### Patch Changes

- Updated dependencies [a6e81f15]
- Updated dependencies [6f434989]
  - blitz@2.0.0-beta.13

## 2.0.0-beta.12

### Patch Changes

- Updated dependencies [3a602b61]
- Updated dependencies [f39ba1ff]
  - blitz@2.0.0-beta.12

## 2.0.0-beta.11

### Patch Changes

- 1476a577: Fix release
- Updated dependencies [1476a577]
  - blitz@2.0.0-beta.11

## 2.0.0-beta.10

### Patch Changes

- 9fe0cc54: Fix auth related React hydration errors by not redirecting until after component mount.
- Updated dependencies [9db6c885]
- Updated dependencies [d98e4bac]
- Updated dependencies [9fe0cc54]
- Updated dependencies [af58e2b2]
- Updated dependencies [2ade7268]
- Updated dependencies [0edeaa37]
- Updated dependencies [430f6ec7]
- Updated dependencies [15d22af2]
- Updated dependencies [aa34661f]
- Updated dependencies [8e0c9d76]
- Updated dependencies [e2c18895]
  - blitz@2.0.0-beta.5

## 2.0.0-beta.4

### Patch Changes

- 713aead9: Allow specifying custom strategy name in Blitz's passport adapter
- Updated dependencies [c213d521]
- Updated dependencies [0b94a450]
- Updated dependencies [161270e3]
  - blitz@2.0.0-beta.4

## 2.0.0-beta.3

### Patch Changes

- Updated dependencies [638f2319]
  - blitz@2.0.0-beta.3

## 2.0.0-beta.2

### Patch Changes

- db7233db: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- Updated dependencies [db7233db]
- Updated dependencies [0936cb38]
- Updated dependencies [3f9fe8f0]
  - blitz@2.0.0-beta.2

## 2.0.0-beta.1

### Patch Changes

- 0f4926fd: Set current Blitz tag to latest
  - blitz@2.0.0-beta.1

## 2.0.0-beta.72

### Patch Changes

- 2cc888ef: Beta release
- Updated dependencies [2cc888ef]
  - blitz@2.0.0-beta.72

## 2.0.0-alpha.71

### Patch Changes

- blitz@2.0.0-alpha.71

## 2.0.0-alpha.70

### Patch Changes

- blitz@2.0.0-alpha.70

## 2.0.0-alpha.69

### Patch Changes

- Updated dependencies [fd31e56b]
  - blitz@2.0.0-alpha.69

## 2.0.0-alpha.68

### Patch Changes

- Updated dependencies [271c58ac]
- Updated dependencies [630c7181]
- Updated dependencies [f0ca738d]
- Updated dependencies [41608c4c]
  - blitz@2.0.0-alpha.68

## 2.0.0-alpha.67

### Patch Changes

- blitz@2.0.0-alpha.67

## 2.0.0-alpha.66

### Patch Changes

- a3e6c49c: Fixes the supports-color warning for pnpm
- Updated dependencies [928e840b]
- Updated dependencies [240f3f34]
- Updated dependencies [55b1cb20]
- Updated dependencies [4d7d126d]
- Updated dependencies [890b0c0c]
- Updated dependencies [807a2b56]
- Updated dependencies [a3e6c49c]
  - blitz@2.0.0-alpha.66

## 2.0.0-alpha.65

### Patch Changes

- Updated dependencies [dd5f5174]
  - blitz@2.0.0-alpha.65

## 2.0.0-alpha.64

### Patch Changes

- Updated dependencies [54db8a46]
- Updated dependencies [62bf12b5]
  - blitz@2.0.0-alpha.64

## 2.0.0-alpha.63

### Patch Changes

- blitz@2.0.0-alpha.63

## 2.0.0-alpha.62

### Patch Changes

- Updated dependencies [365e6709]
  - blitz@2.0.0-alpha.62

## 2.0.0-alpha.61

### Patch Changes

- Updated dependencies [240f378b]
  - blitz@2.0.0-alpha.61

## 2.0.0-alpha.60

### Patch Changes

- Updated dependencies [1d863f35]
  - blitz@2.0.0-alpha.60

## 2.0.0-alpha.59

### Patch Changes

- blitz@2.0.0-alpha.59

## 2.0.0-alpha.58

### Patch Changes

- 83b35590: Truncate errors from `api/auth/<strategy>/callback` request to 100 characters before passing them to the `?authError=` query parameter
- Updated dependencies [83b35590]
  - blitz@2.0.0-alpha.58

## 2.0.0-alpha.57

### Patch Changes

- Updated dependencies [3511d5b6]
  - blitz@2.0.0-alpha.57

## 2.0.0-alpha.56

### Patch Changes

- 3f20a474: Update `deleteSession` return type — allow undefined values
- abe2afcc: Fix a long-standing issue with occasional blitz auth flakiness

  This bug would sometimes cause users to be logged out or to experience an CSRFTokenMismatchError. This bug, when encountered, usually by lots of setPublicData or session.create calls, would not set the cookie headers correctly resulting in cookies being set to a previous state or in a possibly undefined state.

  There are no security concerns as far as I can tell.

- 8bcb471a: Fix auth issue where session token and publicData cookie were updated unnecessarily, leading to potential user logout

  - Previously, we were updating the session token each time public data changed. This is not needed, and it would cause race condition bugs where a user could be unexpectedly logged out because a request already in flight would not match the new session token.
  - Previously, we were updating the publicData cookie even when it hadn't changed. This may reduce unnecessary re-renders on the client.

- Updated dependencies [abb1ad5d]
- Updated dependencies [abe2afcc]
- Updated dependencies [0ac6e171]
- Updated dependencies [8bcb471a]
  - blitz@2.0.0-alpha.56

## 2.0.0-alpha.55

### Patch Changes

- 1c809094: Fix `Page.authenticate` not working for layout components
- Updated dependencies [8f166a5d]
- Updated dependencies [54a66a95]
  - blitz@2.0.0-alpha.55

## 2.0.0-alpha.54

### Patch Changes

- Updated dependencies [f397cc20]
- Updated dependencies [cacb65d6]
- Updated dependencies [348fd6f5]
- Updated dependencies [20fc9f80]
- Updated dependencies [a3bbe6ce]
- Updated dependencies [ffa7b5cc]
  - blitz@2.0.0-alpha.54

## 2.0.0-alpha.53

### Patch Changes

- blitz@2.0.0-alpha.53

## 2.0.0-alpha.52

### Patch Changes

- blitz@2.0.0-alpha.52

## 2.0.0-alpha.51

### Patch Changes

- blitz@2.0.0-alpha.51

## 2.0.0-alpha.50

### Patch Changes

- blitz@2.0.0-alpha.50

## 2.0.0-alpha.49

### Patch Changes

- blitz@2.0.0-alpha.49

## 2.0.0-alpha.48

### Patch Changes

- Updated dependencies [93851d90]
  - blitz@2.0.0-alpha.48

## 2.0.0-alpha.47

### Patch Changes

- 1d9804a6: Remove references to the logging package
- Updated dependencies [1d9804a6]
  - blitz@2.0.0-alpha.47

## 2.0.0-alpha.46

### Patch Changes

- blitz@2.0.0-alpha.46

## 2.0.0-alpha.45

### Patch Changes

- blitz@2.0.0-alpha.45

## 2.0.0-alpha.44

### Patch Changes

- 7817fe3a: Add missing RouteUrlObject on Page.authenticate.redirectTo
  - blitz@2.0.0-alpha.44

## 2.0.0-alpha.43

### Patch Changes

- Updated dependencies [527e48ac]
  - blitz@2.0.0-alpha.43

## 2.0.0-alpha.42

### Patch Changes

- blitz@2.0.0-alpha.42

## 2.0.0-alpha.41

### Patch Changes

- blitz@2.0.0-alpha.41

## 2.0.0-alpha.40

### Patch Changes

- blitz@2.0.0-alpha.40

## 2.0.0-alpha.39

### Patch Changes

- Updated dependencies [b918055b]
  - blitz@2.0.0-alpha.39

## 2.0.0-alpha.38

### Patch Changes

- blitz@2.0.0-alpha.38

## 2.0.0-alpha.37

### Patch Changes

- a80d2a8f: rename middleware type for blitz server plugin
- Updated dependencies [a80d2a8f]
  - blitz@2.0.0-alpha.37

## 2.0.0-alpha.36

### Patch Changes

- blitz@2.0.0-alpha.36

## 2.0.0-alpha.35

### Patch Changes

- blitz@2.0.0-alpha.35

## 2.0.0-alpha.34

### Patch Changes

- blitz@2.0.0-alpha.34

## 2.0.0-alpha.33

### Patch Changes

- blitz@2.0.0-alpha.33

## 2.0.0-alpha.32

### Patch Changes

- blitz@2.0.0-alpha.32

## 2.0.0-alpha.31

### Patch Changes

- blitz@2.0.0-alpha.31

## 2.0.0-alpha.30

### Patch Changes

- Updated dependencies [ce453683]
  - blitz@2.0.0-alpha.30

## 2.0.0-alpha.29

### Patch Changes

- Updated dependencies [962eb58a]
  - blitz@2.0.0-alpha.29

## 2.0.0-alpha.28

### Patch Changes

- blitz@2.0.0-alpha.28

## 2.0.0-alpha.27

### Patch Changes

- blitz@2.0.0-alpha.27

## 2.0.0-alpha.26

### Patch Changes

- blitz@2.0.0-alpha.26

## 2.0.0-alpha.25

### Patch Changes

- 1436e761: Add passport adapter to @blitzjs/auth
- Updated dependencies [1436e761]
  - blitz@2.0.0-alpha.25

## 2.0.0-alpha.24

### Patch Changes

- Updated dependencies [8490b072]
  - blitz@2.0.0-alpha.24

## 2.0.0-alpha.23

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.23

## 2.0.0-alpha.22

### Patch Changes

- Updated dependencies
- Updated dependencies [89bf993a]
  - blitz@2.0.0-alpha.22

## 2.0.0-alpha.21

### Patch Changes

- blitz@2.0.0-alpha.21

## 2.0.0-alpha.20

### Patch Changes

- testing set dist-tag
- Updated dependencies
  - blitz@2.0.0-alpha.20

## 2.0.0-alpha.19

### Patch Changes

- blitz@2.0.0-alpha.19

## 2.0.0-alpha.18

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.18

## 2.0.0-alpha.17

### Patch Changes

- blitz@2.0.0-alpha.17

## 2.0.0-alpha.16

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.16

## 2.0.0-alpha.15

### Patch Changes

- blitz@2.0.0-alpha.15

## 2.0.0-alpha.14

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.14

## 2.0.0-alpha.13

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.13

## 2.0.0-alpha.12

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.12

## 2.0.0-alpha.11

### Patch Changes

- blitz@2.0.0-alpha.11

## 2.0.0-alpha.10

### Patch Changes

- blitz@2.0.0-alpha.10

## 2.0.0-alpha.9

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.9

## 2.0.0-alpha.8

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.8

## 2.0.0-alpha.7

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.7

## 2.0.0-alpha.6

### Patch Changes

- fix route manifest codegen
- Updated dependencies
  - blitz@2.0.0-alpha.6

## 2.0.0-alpha.5

### Patch Changes

- new app template
- Updated dependencies
  - blitz@2.0.0-alpha.5

## 2.0.0-alpha.4

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.4

## 2.0.0-alpha.3

### Patch Changes

- Updated dependencies
  - blitz@2.0.0-alpha.3

## 2.0.0-alpha.2

### Patch Changes

- blitz@2.0.0-alpha.2

## 2.0.0-alpha.1

### Patch Changes

- 46a34c7b: initial publish
- Updated dependencies [46a34c7b]
  - blitz@2.0.0-alpha.1
