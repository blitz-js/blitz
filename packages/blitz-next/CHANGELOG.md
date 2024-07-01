# @blitzjs/next

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
  - @blitzjs/rpc@3.0.0

## 2.0.10

### Patch Changes

- Updated dependencies [318e9740d]
  - blitz@2.0.10
  - @blitzjs/rpc@2.0.10

## 2.0.9

### Patch Changes

- 5a14306f7: fix export `enhancePrisma` in client
- Updated dependencies [5a14306f7]
  - @blitzjs/rpc@2.0.9
  - blitz@2.0.9

## 2.0.8

### Patch Changes

- 5e61a1681: bug: merge existing and custom blitz turbo configs
- Updated dependencies [5e61a1681]
- Updated dependencies [77555468f]
  - blitz@2.0.8
  - @blitzjs/rpc@2.0.8

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
  - @blitzjs/rpc@2.0.7

## 2.0.6

### Patch Changes

- Updated dependencies [76a2544f9]
  - blitz@2.0.6
  - @blitzjs/rpc@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [6f54841b7]
  - blitz@2.0.5
  - @blitzjs/rpc@2.0.5

## 2.0.4

### Patch Changes

- 28a79040e: feat: export `BlitzServerMiddleware` from blitz-next with stronger types
- Updated dependencies [dd604c767]
- Updated dependencies [28a79040e]
  - blitz@2.0.4
  - @blitzjs/rpc@2.0.4

## 2.0.3

### Patch Changes

- 2f5c8a3a0: Address missing sodium native prebuilds required to use secure-password during server rendering
- Updated dependencies [2f5c8a3a0]
  - @blitzjs/rpc@2.0.3
  - blitz@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies [e8fd12e4f]
  - @blitzjs/rpc@2.0.2
  - blitz@2.0.2

## 2.0.1

### Patch Changes

- 8782aae64: Fix outdated code in npm caused in during exit to stable release
- Updated dependencies [8782aae64]
  - blitz@2.0.1
  - @blitzjs/rpc@2.0.1

## 2.0.0

### Major Changes

- 3ddb57072: ⚠️ Breaking Change:
  Next.js version 13.5 or above is now required to use `@blitzjs/next`

  Fix `Error: Cannot find module 'next/dist/shared/lib/router/utils/resolve-href'` by updating the location of next.js internal function.

### Minor Changes

- c1e004063: transpile packages to es2015 to support older browsers
- eda14fa8a: Add ability to format the error on the server before returning it to the client.
- cadefb88e: - New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
  - New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
  - New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
  - Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps
- 6ece09613: Decoupled Blitz RPC from Blitz Auth to allow independent use.
- acc07ce94: Fix Next 13.2 compatibility

  This updates the suspense patch to work with Next.js 13.2+. Hopefully soon we can stop patching once Next.js catches up with all the other frameworks and properly [exposes the `onRecoverableError` react hook](https://github.com/vercel/next.js/discussions/36641).

- 3d004dc41: Fix the DYNAMIC_SERVER_USAGE error for Next.js 13.3.1+
- 03bad3175: fix Cannot read properties of null (reading 'isReady') for pnpm/yarn v3
- 11b548ede: Change setupBlitzServer logger config to be optional. Will default to BlitzLogger

### Patch Changes

- db7233db6: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- c5c727cb6: add mounted check inside withBlitz
- 5166e5e03: (feat) upgrade tslog to v4.8.2
- 1e1bb73b2: Fix codegen and postinstall to make work with pnpm
- aec1bb076: blitz-next: Fix `next/head` used in app directory warning
- a3c92cb86: Allow using `RouteUrlObject` as `redirect.destination` in `getStaticProps` and `getServerSideProps`
- 82649f341: Upgrade tslog to `4.9.0`.

  This due a [tslog issue](https://github.com/fullstack-build/tslog/issues/227) that causes tslog to crash when attempting to log an error whose constructor expects more than one argument.

- 69fb28034: Allow setting static page properties (e.g. `getInitialProps`) on the App component
- 9c2e7d372: Use `useRouter` from next/router in useParams function
- 9631c4583: added superjson
- 7817fe3a8: Add missing RouteUrlObject on Page.authenticate.redirectTo
- 0e762fb55: export BlitzPage & BlitzLayout types from @blitzjs/next
- 3b213a35b: Export router-context from browser entrypoint
- 8b4bf999c: Update dependencies
- 1476a577b: Fix release
- a6e81f156: Add BlitzLogger plugin and allow customizing logging
- ae0b714f6: Allow passing optional type argument for ParamsType in GSSP
- d9fc5d8e2: Allow prefetching multiple queries in gSSP and gSP
- ccb1af8d0: Avoid `invalid config detected` warnings by deleting `"blitz"` key from next config object
- bf1b2c824: fix route manifest codegen
- 1742eb45d: Fix prefetching infinite Blitz queries.
- 9fe0cc546: Fix auth related React hydration errors by not redirecting until after component mount.
- 0b94a4503: Upgrade superjson to the latest version
- 6ff9ec0d7: Upgrade @types/react, fix typings inside @blitzjs/next
- bee19a259: Support RPC error middleware
- a80d2a8f7: rename middleware type for blitz server plugin
- da17cc8a2: Support `prefetchBlitzQuery` in gSSP and gSP
- b84c5bedb: Next 14 Compatibility
- 348fd6f5e: Fix redirectAuthenticatedTo errors
- 9ded8dacb: useParam & useParams functions now accessible from @blitzjs/next
- a7e37c58d: Export BlitzProvider from @blitzjs/next
- 20fc9f80f: Fix SSP / SP not prefetching queries correctly
- 46a34c7b3: initial publish
- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- adabb11a0: - Add mounted check to withBlitz
  - Upgrade @types/react, fix typings inside @blitzjs/next
  - Support prefetchBlitzQuery in gSP and gSSP
  - Add db seed cli command
  - Add try/catch to changePassword mutation
- 2150dcc3e: Setup SuperJson for GSSP and GSP
- 0f4926fd1: Set current Blitz tag to latest
- 5c5decbce: Removes the suspense wrapper from withBlitz since it's not needed
- dc694cf1c: Removes the check for when withBlitz is mounted before rendering the users app. We had this previously to avoid the react 18 suspense error being showin in development with nextjs.
- 807a2b564: Fixes peer dependency warnings
- 97469a126: Added option `role` to `authenticate` property of `BlitzPage` to authenticate page with respect to the role of the user. `String` value or `Array` of strings can be passed to authorize users.
- 931156c35: Rename prefetchBlitzQuery to prefetchQuery, add prefetchInfiniteQuery
- 1d9804a61: Remove references to the logging package
- 022392c12: - Updates `ts-log` peer dependency to `4.9.0`
  - Removes `javascript` from `blitz new` menu
  - Hot Fix the `Update Schema` when using blitz generator
- f52ca398e: Upgrade react-query to v4
- 0f18c68d6: Avoid reassigning queryClient in prefetch methods
- 6ab9db780: Infer result type in the `api` handler and allow customizing it
- 80e1ead7c: Add jest.config.js to newly generated typescript apps
- bec9512e3: Allow resolverPath to be a function which is ran for every file path that is converted to RPC Route
- a3e6c49c4: Fixes the supports-color warning for pnpm
- 2073714f8: testing set dist-tag
- d87288a2e: Fix postinstall script not being found
- 9ada0f666: Allow customizing PreviewData in gSSP
- b33db0828: Fix ambigious class warning log & upgrade superjson from 1.9.1 to 1.11.0
- f15a51901: various improvements and fixes
- 10f98c681: Add an href property to the generated route manifest that will return a string of the pathname and included query params.
- 8d9ea00e1: Fix prefetching multiple queries causes only the last one to be passed to page
- e2c18895d: Add client testing utilities and a sample test to a new blitz app template
- 00bd849ee: new app template
- b0c21b070: Move blitz config to next.config.js
- 25f4526f7: Treat API Route handler as a middleware. This allows outer middlewares to completely wrap queries and mutations.
- 31d7a6f41: Set prefix in moduleNameWrapper's options in Blitz's jest configuration
- 2cc888eff: Beta release
- Updated dependencies [db7233db6]
- Updated dependencies [1569bd53e]
- Updated dependencies [cee2dec17]
- Updated dependencies [5166e5e03]
- Updated dependencies [72a4e594a]
- Updated dependencies [9db6c8855]
- Updated dependencies [1e1bb73b2]
- Updated dependencies [83b355900]
- Updated dependencies [4cad9cca2]
- Updated dependencies [c1e004063]
- Updated dependencies [365e67094]
- Updated dependencies [fd31e56bc]
- Updated dependencies [74a14b704]
- Updated dependencies [eda14fa8a]
- Updated dependencies [aec1bb076]
- Updated dependencies [270361886]
- Updated dependencies [c721c104d]
- Updated dependencies [82649f341]
- Updated dependencies [072929109]
- Updated dependencies [f397cc203]
- Updated dependencies [cadefb88e]
- Updated dependencies [271c58ac6]
- Updated dependencies [8f166a5db]
- Updated dependencies [8c247e26e]
- Updated dependencies [c5572bec6]
- Updated dependencies [86e8eb7c8]
- Updated dependencies [99205f52d]
- Updated dependencies [6ece09613]
- Updated dependencies [928e840b5]
- Updated dependencies [6f18cbdc9]
- Updated dependencies [ea7561b8e]
- Updated dependencies [1436e7618]
- Updated dependencies [2533caf48]
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
- Updated dependencies [c7ac86b85]
- Updated dependencies [630c71812]
- Updated dependencies [bf1b2c824]
- Updated dependencies [240f3f347]
- Updated dependencies [55b1cb204]
- Updated dependencies [54db8a46d]
- Updated dependencies [962eb58af]
- Updated dependencies [54a66a95d]
- Updated dependencies [9fe0cc546]
- Updated dependencies [55a43ce1f]
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
- Updated dependencies [7b63f0f1f]
- Updated dependencies [03bad3175]
- Updated dependencies [f0ca738d5]
- Updated dependencies [bee19a259]
- Updated dependencies [0936cb38a]
- Updated dependencies [c11f0401c]
- Updated dependencies [989691ec8]
- Updated dependencies [4d7d126d9]
- Updated dependencies [8e5903c0f]
- Updated dependencies [30fd61316]
- Updated dependencies [6f4349896]
- Updated dependencies [942536d9a]
- Updated dependencies [666a3ae3e]
- Updated dependencies [a80d2a8f7]
- Updated dependencies [f6dac093d]
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
- Updated dependencies [f84d77a42]
- Updated dependencies [6811eab1a]
- Updated dependencies [20fc9f80f]
- Updated dependencies [8dedca1a2]
- Updated dependencies [3511d5b69]
- Updated dependencies [46a34c7b3]
- Updated dependencies [e82a79be5]
- Updated dependencies [890b0c0c9]
- Updated dependencies [ed2b0e22c]
- Updated dependencies [430f6ec78]
- Updated dependencies [df7cee84a]
- Updated dependencies [adabb11a0]
- Updated dependencies [38d945a3f]
- Updated dependencies [c3c789740]
- Updated dependencies [240f378b5]
- Updated dependencies [df3265b85]
- Updated dependencies [89bf993a1]
- Updated dependencies [0f4926fd1]
- Updated dependencies [3f9fe8f04]
- Updated dependencies [8aee25c58]
- Updated dependencies [fe8c937d2]
- Updated dependencies [0ac6e1712]
- Updated dependencies [c0a3b1ee3]
- Updated dependencies [e5cd2c862]
- Updated dependencies [807a2b564]
- Updated dependencies [650a157e1]
- Updated dependencies [1d9804a61]
- Updated dependencies [41608c4c3]
- Updated dependencies [a0596279b]
- Updated dependencies [88caa18e6]
- Updated dependencies [022392c12]
- Updated dependencies [17ce29e5e]
- Updated dependencies [f52ca398e]
- Updated dependencies [c126b8191]
- Updated dependencies [c9cf7adc3]
- Updated dependencies [1b798d9a0]
- Updated dependencies [ea7561b8e]
- Updated dependencies [727734955]
- Updated dependencies [f39ba1ff1]
- Updated dependencies [161270e3b]
- Updated dependencies [bec9512e3]
- Updated dependencies [b6b9a1c5a]
- Updated dependencies [8bcb471a5]
- Updated dependencies [a3e6c49c4]
- Updated dependencies [490280240]
- Updated dependencies [15d22af24]
- Updated dependencies [454591293]
- Updated dependencies [0025856b9]
- Updated dependencies [2073714f8]
- Updated dependencies [716e188d1]
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
- Updated dependencies [9620ef6b1]
- Updated dependencies [d5b8faa86]
- Updated dependencies [a3bbe6ce3]
- Updated dependencies [b493c93f8]
- Updated dependencies [3b213a35b]
- Updated dependencies [e2c18895d]
- Updated dependencies [00bd849ee]
- Updated dependencies [ffa7b5ccc]
- Updated dependencies [1f6b0b54c]
- Updated dependencies [527e48ac3]
- Updated dependencies [01f3a03ea]
- Updated dependencies [dfd2408e9]
- Updated dependencies [2cc888eff]
  - blitz@2.0.0
  - @blitzjs/rpc@2.0.0

## 2.0.0-beta.37

### Patch Changes

- b84c5bedb: Next 14 Compatibility
- Updated dependencies [86e8eb7c8]
- Updated dependencies [b84c5bedb]
- Updated dependencies [e5cd2c862]
  - @blitzjs/rpc@2.0.0-beta.37
  - blitz@2.0.0-beta.37

## 2.0.0-beta.36

### Patch Changes

- Updated dependencies [09e0c68db]
  - blitz@2.0.0-beta.36
  - @blitzjs/rpc@2.0.0-beta.36

## 2.0.0-beta.35

### Patch Changes

- aec1bb076: blitz-next: Fix `next/head` used in app directory warning
- Updated dependencies [cee2dec17]
- Updated dependencies [aec1bb076]
- Updated dependencies [b97366c42]
- Updated dependencies [3bcbad1a9]
  - blitz@2.0.0-beta.35
  - @blitzjs/rpc@2.0.0-beta.35

## 2.0.0-beta.34

### Major Changes

- 3ddb57072: ⚠️ Breaking Change:
  Next.js version 13.5 or above is now required to use `@blitzjs/next`

  Fix `Error: Cannot find module 'next/dist/shared/lib/router/utils/resolve-href'` by updating the location of next.js internal function.

### Patch Changes

- Updated dependencies [30fd61316]
- Updated dependencies [3ddb57072]
- Updated dependencies [fe8c937d2]
  - blitz@2.0.0-beta.34
  - @blitzjs/rpc@2.0.0-beta.34

## 2.0.0-beta.33

### Patch Changes

- 022392c12: - Updates `ts-log` peer dependency to `4.9.0`
  - Removes `javascript` from `blitz new` menu
  - Hot Fix the `Update Schema` when using blitz generator
- Updated dependencies [19898a488]
- Updated dependencies [6811eab1a]
- Updated dependencies [022392c12]
  - @blitzjs/rpc@2.0.0-beta.33
  - blitz@2.0.0-beta.33

## 2.0.0-beta.32

### Patch Changes

- 82649f341: Upgrade tslog to `4.9.0`.

  This due a [tslog issue](https://github.com/fullstack-build/tslog/issues/227) that causes tslog to crash when attempting to log an error whose constructor expects more than one argument.

- Updated dependencies [82649f341]
  - blitz@2.0.0-beta.32
  - @blitzjs/rpc@2.0.0-beta.32

## 2.0.0-beta.31

### Patch Changes

- Updated dependencies [90f1741da]
- Updated dependencies [df3265b85]
  - blitz@2.0.0-beta.31
  - @blitzjs/rpc@2.0.0-beta.31

## 2.0.0-beta.30

### Patch Changes

- Updated dependencies [c5572bec6]
- Updated dependencies [727734955]
  - blitz@2.0.0-beta.30
  - @blitzjs/rpc@2.0.0-beta.30

## 2.0.0-beta.29

### Patch Changes

- Updated dependencies [b6b9a1c5a]
- Updated dependencies [61888d1a3]
  - blitz@2.0.0-beta.29
  - @blitzjs/rpc@2.0.0-beta.29

## 2.0.0-beta.28

### Patch Changes

- 5166e5e03: (feat) upgrade tslog to v4.8.2
- Updated dependencies [5166e5e03]
- Updated dependencies [2533caf48]
- Updated dependencies [c7ac86b85]
  - @blitzjs/rpc@2.0.0-beta.28
  - blitz@2.0.0-beta.28

## 2.0.0-beta.27

### Minor Changes

- eda14fa8a: Add ability to format the error on the server before returning it to the client.
- 3d004dc41: Fix the DYNAMIC_SERVER_USAGE error for Next.js 13.3.1+

### Patch Changes

- Updated dependencies [eda14fa8a]
  - @blitzjs/rpc@2.0.0-beta.27
  - blitz@2.0.0-beta.27

## 2.0.0-beta.26

### Patch Changes

- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- Updated dependencies [e82a79be5]
- Updated dependencies [38d945a3f]
  - @blitzjs/rpc@2.0.0-beta.26
  - blitz@2.0.0-beta.26

## 2.0.0-beta.25

### Patch Changes

- Updated dependencies [f84d77a42]
  - @blitzjs/rpc@2.0.0-beta.25
  - blitz@2.0.0-beta.25

## 2.0.0-beta.24

### Minor Changes

- cadefb88e: - New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
  - New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
  - New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
  - Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps
- acc07ce94: Fix Next 13.2 compatibility

  This updates the suspense patch to work with Next.js 13.2+. Hopefully soon we can stop patching once Next.js catches up with all the other frameworks and properly [exposes the `onRecoverableError` react hook](https://github.com/vercel/next.js/discussions/36641).

### Patch Changes

- Updated dependencies [cadefb88e]
- Updated dependencies [6f18cbdc9]
- Updated dependencies [ea7561b8e]
- Updated dependencies [ea7561b8e]
- Updated dependencies [37aeaa7fa]
  - blitz@2.0.0-beta.24
  - @blitzjs/rpc@2.0.0-beta.24

## 2.0.0-beta.23

### Patch Changes

- Updated dependencies [c3c789740]
  - blitz@2.0.0-beta.23
  - @blitzjs/rpc@2.0.0-beta.23

## 2.0.0-beta.22

### Patch Changes

- Updated dependencies [270361886]
- Updated dependencies [989691ec8]
- Updated dependencies [8aa22a0b2]
  - @blitzjs/rpc@2.0.0-beta.22
  - blitz@2.0.0-beta.22

## 2.0.0-beta.21

### Patch Changes

- 10f98c681: Add an href property to the generated route manifest that will return a string of the pathname and included query params.
- Updated dependencies [d692b4c1d]
- Updated dependencies [0025856b9]
- Updated dependencies [10f98c681]
- Updated dependencies [d5b8faa86]
  - @blitzjs/rpc@2.0.0-beta.21
  - blitz@2.0.0-beta.21

## 2.0.0-beta.20

### Minor Changes

- 6ece0961: Decoupled Blitz RPC from Blitz Auth to allow independent use.
- 03bad317: fix Cannot read properties of null (reading 'isReady') for pnpm/yarn v3

### Patch Changes

- Updated dependencies [74a14b70]
- Updated dependencies [8c247e26]
- Updated dependencies [6ece0961]
- Updated dependencies [03bad317]
- Updated dependencies [650a157e]
- Updated dependencies [a0596279]
  - blitz@2.0.0-beta.20
  - @blitzjs/rpc@2.0.0-beta.20

## 2.0.0-beta.19

### Minor Changes

- c1e00406: transpile packages to es2015 to support older browsers

### Patch Changes

- b33db082: Fix ambigious class warning log & upgrade superjson from 1.9.1 to 1.11.0
- Updated dependencies [c1e00406]
- Updated dependencies [b33db082]
- Updated dependencies [b493c93f]
  - @blitzjs/rpc@2.0.0-beta.19

## 2.0.0-beta.18

### Patch Changes

- Updated dependencies [72a4e594]
- Updated dependencies [ed2b0e22]
- Updated dependencies [c0a3b1ee]
  - @blitzjs/rpc@2.0.0-beta.18

## 2.0.0-beta.17

### Patch Changes

- 8b4bf999: Update dependencies
- 97469a12: Added option `role` to `authenticate` property of `BlitzPage` to authenticate page with respect to the role of the user. `String` value or `Array` of strings can be passed to authorize users.
- Updated dependencies [8b4bf999]
  - @blitzjs/rpc@2.0.0-beta.17

## 2.0.0-beta.16

### Minor Changes

- 11b548ed: Change setupBlitzServer logger config to be optional. Will default to BlitzLogger

### Patch Changes

- Updated dependencies [55a43ce1]
- Updated dependencies [ceb7db27]
  - @blitzjs/rpc@2.0.0-beta.16

## 2.0.0-beta.15

### Patch Changes

- @blitzjs/rpc@2.0.0-beta.15

## 2.0.0-beta.14

### Patch Changes

- @blitzjs/rpc@2.0.0-beta.14

## 2.0.0-beta.13

### Patch Changes

- a6e81f15: Add BlitzLogger plugin and allow customizing logging
- Updated dependencies [7b63f0f1]
  - @blitzjs/rpc@2.0.0-beta.13

## 2.0.0-beta.12

### Patch Changes

- @blitzjs/rpc@2.0.0-beta.12

## 2.0.0-beta.11

### Patch Changes

- 1476a577: Fix release
- Updated dependencies [1476a577]
  - @blitzjs/rpc@2.0.0-beta.11

## 2.0.0-beta.10

### Patch Changes

- 1742eb45: Fix prefetching infinite Blitz queries.
- 9fe0cc54: Fix auth related React hydration errors by not redirecting until after component mount.
- e2c18895: Add client testing utilities and a sample test to a new blitz app template
- 25f4526f: Treat API Route handler as a middleware. This allows outer middlewares to completely wrap queries and mutations.
- Updated dependencies [0edeaa37]
- Updated dependencies [aa34661f]
- Updated dependencies [8e0c9d76]
  - @blitzjs/rpc@2.0.0-beta.10

## 2.0.0-beta.4

### Patch Changes

- 69fb2803: Allow setting static page properties (e.g. `getInitialProps`) on the App component
- 0b94a450: Upgrade superjson to the latest version
- Updated dependencies [c213d521]
- Updated dependencies [0b94a450]
- Updated dependencies [f6dac093]
  - @blitzjs/rpc@2.0.0-beta.4

## 2.0.0-beta.3

### Patch Changes

- @blitzjs/rpc@2.0.0-beta.3

## 2.0.0-beta.2

### Patch Changes

- db7233db: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- Updated dependencies [db7233db]
  - @blitzjs/rpc@2.0.0-beta.2

## 2.0.0-beta.1

### Patch Changes

- 0f4926fd: Set current Blitz tag to latest
- Updated dependencies [0f4926fd]
  - @blitzjs/rpc@2.0.0-beta.1

## 2.0.0-beta.72

### Patch Changes

- 2cc888ef: Beta release
- Updated dependencies [2cc888ef]
  - @blitzjs/rpc@2.0.0-beta.72

## 2.0.0-alpha.71

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.71

## 2.0.0-alpha.70

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.70

## 2.0.0-alpha.69

### Patch Changes

- a3c92cb8: Allow using `RouteUrlObject` as `redirect.destination` in `getStaticProps` and `getServerSideProps`
- Updated dependencies [49028024]
  - @blitzjs/rpc@2.0.0-alpha.69

## 2.0.0-alpha.68

### Patch Changes

- Updated dependencies [630c7181]
  - @blitzjs/rpc@2.0.0-alpha.68

## 2.0.0-alpha.67

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.67

## 2.0.0-alpha.66

### Patch Changes

- ccb1af8d: Avoid `invalid config detected` warnings by deleting `"blitz"` key from next config object
- 807a2b56: Fixes peer dependency warnings
- a3e6c49c: Fixes the supports-color warning for pnpm
- Updated dependencies [807a2b56]
- Updated dependencies [a3e6c49c]
- Updated dependencies [9620ef6b]
  - @blitzjs/rpc@2.0.0-alpha.66

## 2.0.0-alpha.65

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.65

## 2.0.0-alpha.64

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.64

## 2.0.0-alpha.63

### Patch Changes

- f52ca398: Upgrade react-query to v4
- Updated dependencies [f52ca398]
  - @blitzjs/rpc@2.0.0-alpha.63

## 2.0.0-alpha.62

### Patch Changes

- 31d7a6f4: Set prefix in moduleNameWrapper's options in Blitz's jest configuration
  - @blitzjs/rpc@2.0.0-alpha.62

## 2.0.0-alpha.61

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.61

## 2.0.0-alpha.60

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.60

## 2.0.0-alpha.59

### Patch Changes

- 3b213a35: Export router-context from browser entrypoint
- Updated dependencies [3b213a35]
  - @blitzjs/rpc@2.0.0-alpha.59

## 2.0.0-alpha.58

### Patch Changes

- 6ab9db78: Infer result type in the `api` handler and allow customizing it
- Updated dependencies [c721c104]
  - @blitzjs/rpc@2.0.0-alpha.58

## 2.0.0-alpha.57

### Patch Changes

- 0f18c68d: Avoid reassigning queryClient in prefetch methods
- Updated dependencies [716e188d]
  - @blitzjs/rpc@2.0.0-alpha.57

## 2.0.0-alpha.56

### Patch Changes

- d9fc5d8e: Allow prefetching multiple queries in gSSP and gSP
  - @blitzjs/rpc@2.0.0-alpha.56

## 2.0.0-alpha.55

### Patch Changes

- 8d9ea00e: Fix prefetching multiple queries causes only the last one to be passed to page
- Updated dependencies [df7cee84]
  - @blitzjs/rpc@2.0.0-alpha.55

## 2.0.0-alpha.54

### Patch Changes

- 348fd6f5: Fix redirectAuthenticatedTo errors
- 20fc9f80: Fix SSP / SP not prefetching queries correctly
- 80e1ead7: Add jest.config.js to newly generated typescript apps
- Updated dependencies [20fc9f80]
  - @blitzjs/rpc@2.0.0-alpha.54

## 2.0.0-alpha.53

### Patch Changes

- a7e37c58: Export BlitzProvider from @blitzjs/next
  - @blitzjs/rpc@2.0.0-alpha.53

## 2.0.0-alpha.52

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.52

## 2.0.0-alpha.51

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.51

## 2.0.0-alpha.50

### Patch Changes

- dc694cf1: Removes the check for when withBlitz is mounted before rendering the users app. We had this previously to avoid the react 18 suspense error being showin in development with nextjs.
- Updated dependencies [c11f0401]
  - @blitzjs/rpc@2.0.0-alpha.50

## 2.0.0-alpha.49

### Patch Changes

- bec9512e: Allow resolverPath to be a function which is ran for every file path that is converted to RPC Route
- Updated dependencies [bec9512e]
  - @blitzjs/rpc@2.0.0-alpha.49

## 2.0.0-alpha.48

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.48

## 2.0.0-alpha.47

### Patch Changes

- 1d9804a6: Remove references to the logging package
- Updated dependencies [1d9804a6]
  - @blitzjs/rpc@2.0.0-alpha.47

## 2.0.0-alpha.46

### Patch Changes

- bee19a25: Support RPC error middleware
- 9ada0f66: Allow customizing PreviewData in gSSP
- Updated dependencies [bee19a25]
  - @blitzjs/rpc@2.0.0-alpha.46

## 2.0.0-alpha.45

### Patch Changes

- 5c5decbc: Removes the suspense wrapper from withBlitz since it's not needed
  - @blitzjs/rpc@2.0.0-alpha.45

## 2.0.0-alpha.44

### Patch Changes

- 7817fe3a: Add missing RouteUrlObject on Page.authenticate.redirectTo
- ae0b714f: Allow passing optional type argument for ParamsType in GSSP
  - @blitzjs/rpc@2.0.0-alpha.44

## 2.0.0-alpha.43

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.43

## 2.0.0-alpha.42

### Patch Changes

- 9c2e7d37: Use `useRouter` from next/router in useParams function
  - @blitzjs/rpc@2.0.0-alpha.42

## 2.0.0-alpha.41

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.41

## 2.0.0-alpha.40

### Patch Changes

- 9ded8dac: useParam & useParams functions now accessible from @blitzjs/next
  - @blitzjs/rpc@2.0.0-alpha.40

## 2.0.0-alpha.39

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.39

## 2.0.0-alpha.38

### Patch Changes

- Updated dependencies [8aee25c5]
  - @blitzjs/rpc@2.0.0-alpha.38

## 2.0.0-alpha.37

### Patch Changes

- a80d2a8f: rename middleware type for blitz server plugin
  - @blitzjs/rpc@2.0.0-alpha.37

## 2.0.0-alpha.36

### Patch Changes

- Updated dependencies [4cad9cca]
  - @blitzjs/rpc@2.0.0-alpha.36

## 2.0.0-alpha.35

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.35

## 2.0.0-alpha.34

### Patch Changes

- Updated dependencies [dfd2408e]
  - @blitzjs/rpc@2.0.0-alpha.34

## 2.0.0-alpha.33

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.33

## 2.0.0-alpha.32

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.32

## 2.0.0-alpha.31

### Patch Changes

- Updated dependencies [17ce29e5]
  - @blitzjs/rpc@2.0.0-alpha.31

## 2.0.0-alpha.30

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.30

## 2.0.0-alpha.29

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.29

## 2.0.0-alpha.28

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.28

## 2.0.0-alpha.27

### Patch Changes

- Updated dependencies [07292910]
  - @blitzjs/rpc@2.0.0-alpha.27

## 2.0.0-alpha.26

### Patch Changes

- 0e762fb5: export BlitzPage & BlitzLayout types from @blitzjs/next
  - @blitzjs/rpc@2.0.0-alpha.26

## 2.0.0-alpha.25

### Patch Changes

- 931156c3: Rename prefetchBlitzQuery to prefetchQuery, add prefetchInfiniteQuery
- b0c21b07: Move blitz config to next.config.js
  - @blitzjs/rpc@2.0.0-alpha.25

## 2.0.0-alpha.24

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.24

## 2.0.0-alpha.23

### Patch Changes

- various improvements and fixes
  - @blitzjs/rpc@2.0.0-alpha.23

## 2.0.0-alpha.22

### Patch Changes

- c5c727cb: add mounted check inside withBlitz
- 6ff9ec0d: Upgrade @types/react, fix typings inside @blitzjs/next
- da17cc8a: Support `prefetchBlitzQuery` in gSSP and gSP
- - Add mounted check to withBlitz
  - Upgrade @types/react, fix typings inside @blitzjs/next
  - Support prefetchBlitzQuery in gSP and gSSP
  - Add db seed cli command
  - Add try/catch to changePassword mutation
  - @blitzjs/rpc@2.0.0-alpha.22

## 2.0.0-alpha.21

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.21

## 2.0.0-alpha.20

### Patch Changes

- testing set dist-tag
- Updated dependencies
  - @blitzjs/rpc@2.0.0-alpha.20

## 2.0.0-alpha.19

### Patch Changes

- added superjson
- 2150dcc3: Setup SuperJson for GSSP and GSP
  - @blitzjs/rpc@2.0.0-alpha.19

## 2.0.0-alpha.18

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.18

## 2.0.0-alpha.17

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.17

## 2.0.0-alpha.16

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.16

## 2.0.0-alpha.15

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.15

## 2.0.0-alpha.14

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.14

## 2.0.0-alpha.13

### Patch Changes

- Fix codegen and postinstall to make work with pnpm
  - @blitzjs/rpc@2.0.0-alpha.13

## 2.0.0-alpha.12

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.12

## 2.0.0-alpha.11

### Patch Changes

- Fix postinstall script not being found
  - @blitzjs/rpc@2.0.0-alpha.11

## 2.0.0-alpha.10

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.10

## 2.0.0-alpha.9

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.9

## 2.0.0-alpha.8

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.8

## 2.0.0-alpha.7

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.7

## 2.0.0-alpha.6

### Patch Changes

- fix route manifest codegen
- Updated dependencies
  - @blitzjs/rpc@2.0.0-alpha.6

## 2.0.0-alpha.5

### Patch Changes

- new app template
- Updated dependencies
  - @blitzjs/rpc@2.0.0-alpha.5

## 2.0.0-alpha.4

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.4

## 2.0.0-alpha.3

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.3

## 2.0.0-alpha.2

### Patch Changes

- @blitzjs/rpc@2.0.0-alpha.2

## 2.0.0-alpha.1

### Patch Changes

- 46a34c7b: initial publish
- Updated dependencies [46a34c7b]
  - @blitzjs/rpc@2.0.0-alpha.1
