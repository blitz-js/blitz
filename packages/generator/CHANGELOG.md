# @blitzjs/generator

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

## 2.0.10

## 2.0.9

## 2.0.8

## 2.0.7

## 2.0.6

## 2.0.5

## 2.0.4

### Patch Changes

- 71b995003: fix: ajv dependency was not installed with blitz new

## 2.0.3

### Patch Changes

- 47722e045: Fix: search inside any subdirectory to inside `src|app` directories to find `blitz-server.ts` to use the `BlitzCliConfig` configurations.
- 595f400e9: fix: add missing `prettier`, `pretty-quick` and other missing dev dependencies in the new app template

## 2.0.2

## 2.0.1

### Patch Changes

- 8782aae64: Fix outdated code in npm caused in during exit to stable release

## 2.0.0

### Minor Changes

- 7abfb9086: Redesign the index page for newly generated blitz projects

### Patch Changes

- db7233db6: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- 1569bd53e: Upgrade `tslog` to the latest version
- cb63a0ea5: Guard `blitz g` input via an allow-list of characters; throw if unwanted characters are found. Prevents to break the blitz command by accident (https://github.com/blitz-js/blitz/issues/4021).
- c5c727cb6: add mounted check inside withBlitz
- 5166e5e03: (feat) upgrade tslog to v4.8.2
- 047302055: Update prisma-ast dependency to prevent Blitz generator from failing when Prisma keywords are used as model names
- 1e1bb73b2: Fix codegen and postinstall to make work with pnpm
- 4656e6ecd: Print model added or updated in schema.prisma after running model generator
- fd31e56bc: Add back blitz generate command
- 91aa53563: Include `.env.test` file to the generator templates
- e228ba5de: Fix a type error in reset password templates.
- 1e0ec7a97: Add `BlitzPage` type to Home pages in app templates
- 77b7da0f3: Remove husky prepush hook & update precommit hook to only run prettier
- 47c6b62dc: Update examples of generate all in docs to include one column in model.
- 547613937: Remove unnecessary `as number` assertions from new app templates
- 82649f341: Upgrade tslog to `4.9.0`.

  This due a [tslog issue](https://github.com/fullstack-build/tslog/issues/227) that causes tslog to crash when attempting to log an error whose constructor expects more than one argument.

- 8c247e26e: Switch from jest to vitest in new app templates
- 99205f52d: Use alpha version for blitz dependency, fix package manager selection
- e3750b049: codemod fixes
- 824a9b5e2: Fix `no-floating-promises` lint errors after generating pages with Blitz generator by adding `await` to `router.push` calls in the templates
- 4603a2b7b: fix app generator for pnpm unmet dependency
- d6717b9d3: Load schema.prisma path from `package.json` instead of assuming it's `db/schema.prisma`
- 6ac2d3412: updated nextjs version in generator & npmrc file
- 7498aef4f: Fix tsconfig.json referencing blitz-env.d.ts insetad of next-env.d.ts in new app templates
- 2a81af7b7: Update generator templates to use the src directory instead of app
- ea7561b8e: Consolidate mutations schema to new schema.{ts|js} file.
- 176c7b8b5: Use correct path for log utilities import
- 8b4bf999c: Update dependencies
- 1476a577b: Fix release
- b80c3d92c: Fix form paths when running blitz generate all
- b72d1215c: Add vscode debugging configuration to new app templates
- eb9715688: Add `BlitzPage` types to auth pages in new app template
- bf1b2c824: fix route manifest codegen
- 4cad9cca2: Update codemod and template with a new queryClient import location
- c89cb943b: Upgrade next, prisma and zod to latest versions in a newly created app
- bf4aaf1de: Move `useCurrentUser` hook from `core/hooks` to `users/hooks` folder
- b43c1a81c: Remove the random user (noop@blitzjs.com) & use user's default git account when commiting a new generated blitz project.
- 6ff9ec0d7: Upgrade @types/react, fix typings inside @blitzjs/next
- 7aef610d8: Make Next.js version stick to 13.4.5 when generating a new app
- c11f0401c: Update Next.js version and addBasePath location
- 60de05747: Fix reset token being undefined when passed to the resetPassword mutation
- ab4d9de70: Don't try to copy RPC API endpoint in templates that don't have it
- 8e5903c0f: Fix `cannot find module db error` in JavaScript template. Replace requiring the config using `esbuild` with parsing using `jscodeshift` to get the `cliConfig` values. Added logic to find the `blitz-server` file in `src` directory
- 6baab1907: Add type checking to next.config.js files in new app templates
- 8ada2c26f: Include ResetPasswordPage in new app template
- 4e26ae21b: Upgrade eslint-config-next in new app templates to fix linting issues on blitz build
- 430f0b52d: For new applications, update Prisma (`prisma` and `@prisma/client`) from `4.6.0` to `4.6.1` to solve enum issue with postgresql https://github.com/prisma/prisma/issues/16180
- e339e2fd0: Add hoist pattern entry for react-query in new app templates
- 22344d058: New apps generated by the cli was missing the getLayout function in \_app, so when you used the getLayout property on your page, it didn't render. **You'll need to manually update your \_app if you generated an app with blitz v2**.
- 81b4b41a9: add mounted check to app generator template
- d814c2d2d: fix: add missing key prop to LabelSelectField
- 46a34c7b3: initial publish
- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0
- 890b0c0c9: Improve `blitz new` messaging and fix minor issues
- a961aff88: Add missing lint deps to the new app templates
- 83281a846: Fix eslint config in new JavaScript app templates
- 6ec020c6d: Remove useEffect from reset password templates.
- adabb11a0: - Add mounted check to withBlitz
  - Upgrade @types/react, fix typings inside @blitzjs/next
  - Support prefetchBlitzQuery in gSP and gSSP
  - Add db seed cli command
  - Add try/catch to changePassword mutation
- 6d5f9efe1: new blitz app starter
- b1ef45bf2: fix generator npm package dist
- 0f4926fd1: Set current Blitz tag to latest
- bcef81fad: Fix missing MockRouter prop in test utils
- 8aee25c58: getQueryClient function & queryClient codemod updates & shared plugin config
- 35a070ad7: fix source path for templates
- 8fa9a56f6: Fix eslint and types setup in minimal app template
- 807a2b564: Fixes peer dependency warnings
- 022392c12: - Updates `ts-log` peer dependency to `4.9.0`
  - Removes `javascript` from `blitz new` menu
  - Hot Fix the `Update Schema` when using blitz generator
- ebd74b4e9: Fix template path for the generator
- 63605961b: Use routes manifest in template app
- c53978d58: Fix upgrade-legacy `Update imports` step — import `getAntiCSRFToken` and `AuthenticatedMiddlewareCtx` from correct locations
- 17ce29e5e: Update RPC plugin setup in templates
- ea7561b8e: Multiple fields forms using templates during generation - TODO
- a84b8de4e: Remove `-cookie-prefix` appended to the `cookiePrefix` config property in the new app template. It will also fix auth and CSRF issues for users upgrading from a legacy framework.
- 70b334a2f: Remove trailing comma from tsconfig.json file in the new app template"
- 80e1ead7c: Add jest.config.js to newly generated typescript apps
- f39ba1ff1: Allow passing custom templates to the `blitz generate` command. Extend the `generate` command with `custom-templates` to provide an easy starting point for users to customize the default templates: `blitz generate custom-templates`.
- b405c1e87: Add missing \_document.tsx and 404.tsx pages to the new app templates
- 37623a4f4: Fix typo in a next.config.js file name
- dd299ae89: Add ts-jest to dependencies in new app templates
- a3e6c49c4: Fixes the supports-color warning for pnpm
- b86b569d5: Remove as any assertion for the PrismaStorage argument
- bd09db753: Remove `views` property from `Session.PublicData` in `types.ts` file
- d316d0db7: Update all links to follow Next 13 format without a child anchor tag.
- 12cb7a727: Upgrade Prisma to v4.0.0
- 79c5e86d7: Add missing Layout.tsx for generated mimimalapp
- f15a51901: various improvements and fixes
- e2c18895d: Add client testing utilities and a sample test to a new blitz app template
- 00bd849ee: new app template
- 065db256d: Update new app templates to use blitz-rpc's resolver function
- 078fe4741: Add `@testing-library/jest-dom` to new app dependecies
- 36e26193b: fix template sourcepath because of new env variable
- 2cc888eff: Beta release
- 8107138e2: use latest tag for generator template on rpc & auth packages
- f202aac18: Mocks @blitzjs/auth instead of blitz inside the forgotPassword mutation test & hardcodes blitz package version types instead of just using the alpha tag.

## 2.0.0-beta.37

### Patch Changes

- 6d5f9efe1: new blitz app starter

## 2.0.0-beta.36

## 2.0.0-beta.35

### Patch Changes

- c89cb943b: Upgrade next, prisma and zod to latest versions in a newly created app

## 2.0.0-beta.34

## 2.0.0-beta.33

### Patch Changes

- 022392c12: - Updates `ts-log` peer dependency to `4.9.0`
  - Removes `javascript` from `blitz new` menu
  - Hot Fix the `Update Schema` when using blitz generator

## 2.0.0-beta.32

### Patch Changes

- 47c6b62dc: Update examples of generate all in docs to include one column in model.
- 82649f341: Upgrade tslog to `4.9.0`.

  This due a [tslog issue](https://github.com/fullstack-build/tslog/issues/227) that causes tslog to crash when attempting to log an error whose constructor expects more than one argument.

## 2.0.0-beta.31

## 2.0.0-beta.30

## 2.0.0-beta.29

### Patch Changes

- 7aef610d8: Make Next.js version stick to 13.4.5 when generating a new app

## 2.0.0-beta.28

### Patch Changes

- 5166e5e03: (feat) upgrade tslog to v4.8.2

## 2.0.0-beta.27

### Patch Changes

- d814c2d2d: fix: add missing key prop to LabelSelectField

## 2.0.0-beta.26

### Patch Changes

- e82a79be5: Update the version of next in the new template from 13.2 to 13.3.0

## 2.0.0-beta.25

## 2.0.0-beta.24

### Patch Changes

- e228ba5de: Fix a type error in reset password templates.
- ea7561b8e: Consolidate mutations schema to new schema.{ts|js} file.
- 430f0b52d: For new applications, update Prisma (`prisma` and `@prisma/client`) from `4.6.0` to `4.6.1` to solve enum issue with postgresql https://github.com/prisma/prisma/issues/16180
- ea7561b8e: Multiple fields forms using templates during generation - TODO

## 2.0.0-beta.23

### Patch Changes

- cb63a0ea5: Guard `blitz g` input via an allow-list of characters; throw if unwanted characters are found. Prevents to break the blitz command by accident (https://github.com/blitz-js/blitz/issues/4021).
- 6ec020c6d: Remove useEffect from reset password templates.
- d316d0db7: Update all links to follow Next 13 format without a child anchor tag.
- 79c5e86d7: Add missing Layout.tsx for generated mimimalapp

## 2.0.0-beta.22

### Minor Changes

- 7abfb9086: Redesign the index page for newly generated blitz projects

### Patch Changes

- bcef81fad: Fix missing MockRouter prop in test utils

## 2.0.0-beta.21

### Patch Changes

- 77b7da0f3: Remove husky prepush hook & update precommit hook to only run prettier

## 2.0.0-beta.20

### Patch Changes

- 8c247e26: Switch from jest to vitest in new app templates

## 2.0.0-beta.19

### Patch Changes

- b80c3d92: Fix form paths when running blitz generate all

## 2.0.0-beta.18

## 2.0.0-beta.17

### Patch Changes

- 2a81af7b: Update generator templates to use the src directory instead of app
- 8b4bf999: Update dependencies

## 2.0.0-beta.16

### Patch Changes

- 1569bd53: Upgrade `tslog` to the latest version
- 8e5903c0: Fix `cannot find module db error` in JavaScript template. Replace requiring the config using `esbuild` with parsing using `jscodeshift` to get the `cliConfig` values. Added logic to find the `blitz-server` file in `src` directory

## 2.0.0-beta.15

## 2.0.0-beta.14

### Patch Changes

- 54761393: Remove unnecessary `as number` assertions from new app templates
- 60de0574: Fix reset token being undefined when passed to the resetPassword mutation

## 2.0.0-beta.13

### Patch Changes

- 4e26ae21: Upgrade eslint-config-next in new app templates to fix linting issues on blitz build

## 2.0.0-beta.12

### Patch Changes

- f39ba1ff: Allow passing custom templates to the `blitz generate` command. Extend the `generate` command with `custom-templates` to provide an easy starting point for users to customize the default templates: `blitz generate custom-templates`.

## 2.0.0-beta.11

### Patch Changes

- 1476a577: Fix release

## 2.0.0-beta.10

### Patch Changes

- 04730205: Update prisma-ast dependency to prevent Blitz generator from failing when Prisma keywords are used as model names
- 824a9b5e: Fix `no-floating-promises` lint errors after generating pages with Blitz generator by adding `await` to `router.push` calls in the templates
- d6717b9d: Load schema.prisma path from `package.json` instead of assuming it's `db/schema.prisma`
- bf4aaf1d: Move `useCurrentUser` hook from `core/hooks` to `users/hooks` folder
- b43c1a81: Remove the random user (noop@blitzjs.com) & use user's default git account when commiting a new generated blitz project.
- 83281a84: Fix eslint config in new JavaScript app templates
- bd09db75: Remove `views` property from `Session.PublicData` in `types.ts` file
- e2c18895: Add client testing utilities and a sample test to a new blitz app template

## 2.0.0-beta.4

### Patch Changes

- 7498aef4: Fix tsconfig.json referencing blitz-env.d.ts insetad of next-env.d.ts in new app templates
- 22344d05: New apps generated by the cli was missing the getLayout function in \_app, so when you used the getLayout property on your page, it didn't render. **You'll need to manually update your \_app if you generated an app with blitz v2**.
- 8fa9a56f: Fix eslint and types setup in minimal app template
- c53978d5: Fix upgrade-legacy `Update imports` step — import `getAntiCSRFToken` and `AuthenticatedMiddlewareCtx` from correct locations
- a84b8de4: Remove `-cookie-prefix` appended to the `cookiePrefix` config property in the new app template. It will also fix auth and CSRF issues for users upgrading from a legacy framework.

## 2.0.0-beta.3

### Patch Changes

- b72d1215: Add vscode debugging configuration to new app templates

## 2.0.0-beta.2

### Patch Changes

- db7233db: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- eb971568: Add `BlitzPage` types to auth pages in new app template
- 8ada2c26: Include ResetPasswordPage in new app template

## 2.0.0-beta.1

### Patch Changes

- 0f4926fd: Set current Blitz tag to latest

## 2.0.0-beta.72

### Patch Changes

- 2cc888ef: Beta release

## 2.0.0-alpha.71

### Patch Changes

- 176c7b8b: Use correct path for log utilities import

## 2.0.0-alpha.70

### Patch Changes

- 4656e6ec: Print model added or updated in schema.prisma after running model generator
- 1e0ec7a9: Add `BlitzPage` type to Home pages in app templates

## 2.0.0-alpha.69

### Patch Changes

- fd31e56b: Add back blitz generate command
- 6baab190: Add type checking to next.config.js files in new app templates
- 37623a4f: Fix typo in a next.config.js file name

## 2.0.0-alpha.68

### Patch Changes

- 70b334a2: Remove trailing comma from tsconfig.json file in the new app template"
- dd299ae8: Add ts-jest to dependencies in new app templates
- 078fe474: Add `@testing-library/jest-dom` to new app dependecies

## 2.0.0-alpha.67

### Patch Changes

- ebd74b4e: Fix template path for the generator

## 2.0.0-alpha.66

### Patch Changes

- 91aa5356: Include `.env.test` file to the generator templates
- 890b0c0c: Improve `blitz new` messaging and fix minor issues
- 807a2b56: Fixes peer dependency warnings
- a3e6c49c: Fixes the supports-color warning for pnpm
- 065db256: Update new app templates to use blitz-rpc's resolver function
- f202aac1: Mocks @blitzjs/auth instead of blitz inside the forgotPassword mutation test & hardcodes blitz package version types instead of just using the alpha tag.

## 2.0.0-alpha.65

## 2.0.0-alpha.64

## 2.0.0-alpha.63

## 2.0.0-alpha.62

## 2.0.0-alpha.61

## 2.0.0-alpha.60

## 2.0.0-alpha.59

## 2.0.0-alpha.58

### Patch Changes

- e339e2fd: Add hoist pattern entry for react-query in new app templates

## 2.0.0-alpha.57

## 2.0.0-alpha.56

## 2.0.0-alpha.55

### Patch Changes

- ab4d9de7: Don't try to copy RPC API endpoint in templates that don't have it

## 2.0.0-alpha.54

### Patch Changes

- a961aff8: Add missing lint deps to the new app templates
- 80e1ead7: Add jest.config.js to newly generated typescript apps

## 2.0.0-alpha.53

## 2.0.0-alpha.52

### Patch Changes

- 12cb7a72: Upgrade Prisma to v4.0.0

## 2.0.0-alpha.51

## 2.0.0-alpha.50

### Patch Changes

- c11f0401: Update Next.js version and addBasePath location

## 2.0.0-alpha.49

## 2.0.0-alpha.48

## 2.0.0-alpha.47

### Patch Changes

- b405c1e8: Add missing \_document.tsx and 404.tsx pages to the new app templates
- b86b569d: Remove as any assertion for the PrismaStorage argument

## 2.0.0-alpha.46

## 2.0.0-alpha.45

## 2.0.0-alpha.44

## 2.0.0-alpha.43

## 2.0.0-alpha.42

## 2.0.0-alpha.41

## 2.0.0-alpha.40

## 2.0.0-alpha.39

## 2.0.0-alpha.38

### Patch Changes

- 8aee25c5: getQueryClient function & queryClient codemod updates & shared plugin config

## 2.0.0-alpha.37

## 2.0.0-alpha.36

### Patch Changes

- 4cad9cca: Update codemod and template with a new queryClient import location

## 2.0.0-alpha.35

### Patch Changes

- e3750b04: codemod fixes

## 2.0.0-alpha.34

## 2.0.0-alpha.33

## 2.0.0-alpha.32

## 2.0.0-alpha.31

### Patch Changes

- 17ce29e5: Update RPC plugin setup in templates

## 2.0.0-alpha.30

## 2.0.0-alpha.29

## 2.0.0-alpha.28

### Patch Changes

- 6ac2d341: updated nextjs version in generator & npmrc file

## 2.0.0-alpha.27

## 2.0.0-alpha.26

## 2.0.0-alpha.25

## 2.0.0-alpha.24

## 2.0.0-alpha.23

### Patch Changes

- various improvements and fixes

## 2.0.0-alpha.22

### Patch Changes

- c5c727cb: add mounted check inside withBlitz
- 6ff9ec0d: Upgrade @types/react, fix typings inside @blitzjs/next
- 81b4b41a: add mounted check to app generator template
- - Add mounted check to withBlitz
  - Upgrade @types/react, fix typings inside @blitzjs/next
  - Support prefetchBlitzQuery in gSP and gSSP
  - Add db seed cli command
  - Add try/catch to changePassword mutation

## 2.0.0-alpha.21

### Patch Changes

- use latest tag for generator template on rpc & auth packages

## 2.0.0-alpha.20

## 2.0.0-alpha.19

### Patch Changes

- 63605961: Use routes manifest in template app

## 2.0.0-alpha.18

## 2.0.0-alpha.17

### Patch Changes

- fix app generator for pnpm unmet dependency

## 2.0.0-alpha.16

## 2.0.0-alpha.15

### Patch Changes

- fix template sourcepath because of new env variable

## 2.0.0-alpha.14

## 2.0.0-alpha.13

### Patch Changes

- Fix codegen and postinstall to make work with pnpm

## 2.0.0-alpha.12

### Patch Changes

- Use alpha version for blitz dependency, fix package manager selection

## 2.0.0-alpha.11

## 2.0.0-alpha.10

### Patch Changes

- fix source path for templates

## 2.0.0-alpha.9

## 2.0.0-alpha.8

## 2.0.0-alpha.7

## 2.0.0-alpha.6

### Patch Changes

- fix route manifest codegen

## 2.0.0-alpha.5

### Patch Changes

- new app template

## 2.0.0-alpha.4

## 2.0.0-alpha.3

## 2.0.0-alpha.2

### Patch Changes

- fix generator npm package dist

## 2.0.0-alpha.1

### Patch Changes

- 46a34c7b: initial publish
