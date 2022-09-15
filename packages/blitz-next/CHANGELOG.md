# @blitzjs/next

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
