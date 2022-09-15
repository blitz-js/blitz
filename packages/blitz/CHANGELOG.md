# blitz

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
