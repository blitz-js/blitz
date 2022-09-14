# @blitzjs/codemod

## 2.0.0-beta.4

### Patch Changes

- d3403cf8: Show file path on error when running the upgrade legacy codemod.
- 74a4ce8e: Add `AuthenticatedSessionContext` to the `upgrade-legacy` codemod import map
- 43e65cfe: Remove TypeScript type annotations from `next.config.js` (a JavaScript file) in the `upgrade-legacy` codemod.
- da914c92: Convert import statements to require when creating the next.config.js file in the codemod
- Updated dependencies [7498aef4]
- Updated dependencies [c213d521]
- Updated dependencies [0b94a450]
- Updated dependencies [22344d05]
- Updated dependencies [8fa9a56f]
- Updated dependencies [c53978d5]
- Updated dependencies [a84b8de4]
- Updated dependencies [161270e3]
  - @blitzjs/generator@2.0.0-beta.4
  - blitz@2.0.0-beta.4

## 2.0.0-beta.3

### Patch Changes

- 2313fa61: Fix upgrade-legacy codemod replacing identifiers with an invalid value. Previously new values were hardcoded to `NextApiRequest`. Now we're using correct values provided as `replaceIdentifiers` function argument.
- 1bf185d6: Add a new codemod step to update the .eslintrc.js file
- Updated dependencies [638f2319]
- Updated dependencies [b72d1215]
  - blitz@2.0.0-beta.3
  - @blitzjs/generator@2.0.0-beta.3

## 2.0.0-beta.2

### Patch Changes

- db7233db: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- a3b5fdd0: Change ES6 import for `withBlitz` during the codemod to the require syntax.
- ebfb562b: Add `Script` as a default import from next.js during the codemod.
- Updated dependencies [db7233db]
- Updated dependencies [eb971568]
- Updated dependencies [0936cb38]
- Updated dependencies [8ada2c26]
- Updated dependencies [3f9fe8f0]
  - blitz@2.0.0-beta.2
  - @blitzjs/generator@2.0.0-beta.2

## 2.0.0-beta.1

### Patch Changes

- 0f4926fd: Set current Blitz tag to latest
- Updated dependencies [0f4926fd]
  - @blitzjs/generator@2.0.0-beta.1
  - blitz@2.0.0-beta.1

## 2.0.0-beta.72

### Patch Changes

- 2cc888ef: Beta release
- Updated dependencies [2cc888ef]
  - blitz@2.0.0-beta.72
  - @blitzjs/generator@2.0.0-beta.72

## 2.0.0-alpha.71

### Patch Changes

- Updated dependencies [176c7b8b]
  - @blitzjs/generator@2.0.0-alpha.71
  - blitz@2.0.0-alpha.71

## 2.0.0-alpha.70

### Patch Changes

- f88702c1: Remove trailing comma when removing BlitzConfig from next.config.js & Fix codemod so if route (eg. `app/auth/pages`) convert to (eg. `pages/`) instead of (eg. `pages/auth`)
- Updated dependencies [4656e6ec]
- Updated dependencies [1e0ec7a9]
  - @blitzjs/generator@2.0.0-alpha.70
  - blitz@2.0.0-alpha.70

## 2.0.0-alpha.69

### Patch Changes

- 86af6dec: Wrap middlewares with BlitzServerMiddleware function with codemod
- 72a332e0: Wrap `blitz.config.ts` with the `withBlitz` function during the codemod step instead of creating a blank `next.config.js` file.
- 2d1482fc: Allow codemod to finish if `cookiePrefix` is undefined. Then show error at the end of running the codemod.
- Updated dependencies [fd31e56b]
- Updated dependencies [6baab190]
- Updated dependencies [37623a4f]
  - blitz@2.0.0-alpha.69
  - @blitzjs/generator@2.0.0-alpha.69

## 2.0.0-alpha.68

### Patch Changes

- 06427f67: Throw error if cookiePrefix is undefined when running codemod
- f120f672: Add DocumentProps & DocumentContext to the codemod import map
- 8dfaad08: Set correct packages versions in package.json with upgrade-legacy codemod
- cb55ed26: Fix codemod to accept a self closing `DocumentHead` in the `_document` page
- Updated dependencies [271c58ac]
- Updated dependencies [630c7181]
- Updated dependencies [f0ca738d]
- Updated dependencies [41608c4c]
- Updated dependencies [70b334a2]
- Updated dependencies [dd299ae8]
- Updated dependencies [078fe474]
  - blitz@2.0.0-alpha.68
  - @blitzjs/generator@2.0.0-alpha.68

## 2.0.0-alpha.67

### Patch Changes

- Updated dependencies [ebd74b4e]
  - @blitzjs/generator@2.0.0-alpha.67
  - blitz@2.0.0-alpha.67

## 2.0.0-alpha.66

### Patch Changes

- Updated dependencies [91aa5356]
- Updated dependencies [928e840b]
- Updated dependencies [240f3f34]
- Updated dependencies [55b1cb20]
- Updated dependencies [4d7d126d]
- Updated dependencies [890b0c0c]
- Updated dependencies [807a2b56]
- Updated dependencies [a3e6c49c]
- Updated dependencies [065db256]
- Updated dependencies [f202aac1]
  - @blitzjs/generator@2.0.0-alpha.66
  - blitz@2.0.0-alpha.66

## 2.0.0-alpha.65

### Patch Changes

- Updated dependencies [dd5f5174]
  - blitz@2.0.0-alpha.65
  - @blitzjs/generator@2.0.0-alpha.65

## 2.0.0-alpha.64

### Patch Changes

- Updated dependencies [54db8a46]
- Updated dependencies [62bf12b5]
  - blitz@2.0.0-alpha.64
  - @blitzjs/generator@2.0.0-alpha.64

## 2.0.0-alpha.63

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.63
- blitz@2.0.0-alpha.63

## 2.0.0-alpha.62

### Patch Changes

- Updated dependencies [365e6709]
  - blitz@2.0.0-alpha.62
  - @blitzjs/generator@2.0.0-alpha.62

## 2.0.0-alpha.61

### Patch Changes

- Updated dependencies [240f378b]
  - blitz@2.0.0-alpha.61
  - @blitzjs/generator@2.0.0-alpha.61

## 2.0.0-alpha.60

### Patch Changes

- Updated dependencies [1d863f35]
  - blitz@2.0.0-alpha.60
  - @blitzjs/generator@2.0.0-alpha.60

## 2.0.0-alpha.59

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.59
- blitz@2.0.0-alpha.59

## 2.0.0-alpha.58

### Patch Changes

- dcdcd040: These are various changes to will make the codemod more dynamic and work with a larger variety of codebases. These fixes are implemented to make the codemod work with flightdeck.
- 7e538ba4: Import ErrorComponent as DefaultErrorComponent
- 8e00605a: Updates the error messages based on if it's a babel parse error or an unexpected error
- Updated dependencies [83b35590]
- Updated dependencies [e339e2fd]
  - blitz@2.0.0-alpha.58
  - @blitzjs/generator@2.0.0-alpha.58

## 2.0.0-alpha.57

### Patch Changes

- Updated dependencies [3511d5b6]
  - blitz@2.0.0-alpha.57
  - @blitzjs/generator@2.0.0-alpha.57

## 2.0.0-alpha.56

### Patch Changes

- Updated dependencies [abb1ad5d]
- Updated dependencies [abe2afcc]
- Updated dependencies [0ac6e171]
- Updated dependencies [8bcb471a]
  - blitz@2.0.0-alpha.56
  - @blitzjs/generator@2.0.0-alpha.56

## 2.0.0-alpha.55

### Patch Changes

- Updated dependencies [8f166a5d]
- Updated dependencies [54a66a95]
- Updated dependencies [ab4d9de7]
  - blitz@2.0.0-alpha.55
  - @blitzjs/generator@2.0.0-alpha.55

## 2.0.0-alpha.54

### Patch Changes

- Updated dependencies [f397cc20]
- Updated dependencies [cacb65d6]
- Updated dependencies [348fd6f5]
- Updated dependencies [20fc9f80]
- Updated dependencies [a961aff8]
- Updated dependencies [80e1ead7]
- Updated dependencies [a3bbe6ce]
- Updated dependencies [ffa7b5cc]
  - blitz@2.0.0-alpha.54
  - @blitzjs/generator@2.0.0-alpha.54

## 2.0.0-alpha.53

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.53
- blitz@2.0.0-alpha.53

## 2.0.0-alpha.52

### Patch Changes

- Updated dependencies [12cb7a72]
  - @blitzjs/generator@2.0.0-alpha.52
  - blitz@2.0.0-alpha.52

## 2.0.0-alpha.51

### Patch Changes

- 70f9ae49: Handle next/dynamic default import in codemod
  - @blitzjs/generator@2.0.0-alpha.51
  - blitz@2.0.0-alpha.51

## 2.0.0-alpha.50

### Patch Changes

- Updated dependencies [c11f0401]
  - @blitzjs/generator@2.0.0-alpha.50
  - blitz@2.0.0-alpha.50

## 2.0.0-alpha.49

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.49
- blitz@2.0.0-alpha.49

## 2.0.0-alpha.48

### Patch Changes

- 93851d90: Handle duplicate imports with Blitz upgrade-legacy codemod
- Updated dependencies [93851d90]
  - blitz@2.0.0-alpha.48
  - @blitzjs/generator@2.0.0-alpha.48

## 2.0.0-alpha.47

### Patch Changes

- Updated dependencies [1d9804a6]
- Updated dependencies [b405c1e8]
- Updated dependencies [b86b569d]
  - blitz@2.0.0-alpha.47
  - @blitzjs/generator@2.0.0-alpha.47

## 2.0.0-alpha.46

### Patch Changes

- aafdc5b4: Move middlewares from blitz config to blitz server with codemod
  - @blitzjs/generator@2.0.0-alpha.46
  - blitz@2.0.0-alpha.46

## 2.0.0-alpha.45

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.45
- blitz@2.0.0-alpha.45

## 2.0.0-alpha.44

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.44
- blitz@2.0.0-alpha.44

## 2.0.0-alpha.43

### Patch Changes

- Updated dependencies [527e48ac]
  - blitz@2.0.0-alpha.43
  - @blitzjs/generator@2.0.0-alpha.43

## 2.0.0-alpha.42

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.42
- blitz@2.0.0-alpha.42

## 2.0.0-alpha.41

### Patch Changes

- bbac7906: fix codemod for wrapping \_app arrow function & fix codemod for nested pages directory
  - @blitzjs/generator@2.0.0-alpha.41
  - blitz@2.0.0-alpha.41

## 2.0.0-alpha.40

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.40
- blitz@2.0.0-alpha.40

## 2.0.0-alpha.39

### Patch Changes

- Updated dependencies [b918055b]
  - blitz@2.0.0-alpha.39
  - @blitzjs/generator@2.0.0-alpha.39

## 2.0.0-alpha.38

### Patch Changes

- 8aee25c5: getQueryClient function & queryClient codemod updates & shared plugin config
- Updated dependencies [8aee25c5]
  - @blitzjs/generator@2.0.0-alpha.38
  - blitz@2.0.0-alpha.38

## 2.0.0-alpha.37

### Patch Changes

- Updated dependencies [a80d2a8f]
  - blitz@2.0.0-alpha.37
  - @blitzjs/generator@2.0.0-alpha.37

## 2.0.0-alpha.36

### Patch Changes

- 4cad9cca: Update queryClient import in codemod
- Updated dependencies [4cad9cca]
  - @blitzjs/generator@2.0.0-alpha.36
  - blitz@2.0.0-alpha.36

## 2.0.0-alpha.35

### Patch Changes

- e3750b04: codemod fixes
- Updated dependencies [e3750b04]
  - @blitzjs/generator@2.0.0-alpha.35
  - blitz@2.0.0-alpha.35

## 2.0.0-alpha.34

### Patch Changes

- @blitzjs/generator@2.0.0-alpha.34
- blitz@2.0.0-alpha.34

## 2.0.0-alpha.33

### Patch Changes

- 9e05d6e1: allow extension catch in getAllFiles codemod util
  - @blitzjs/generator@2.0.0-alpha.33
  - blitz@2.0.0-alpha.33

## 2.0.0-alpha.32

### Patch Changes

- e6fb09d4: Fix templates source in RPC codemod step
  - @blitzjs/generator@2.0.0-alpha.32
  - blitz@2.0.0-alpha.32

## 2.0.0-alpha.31

### Patch Changes

- 46d9f81a: Update templates directory for codemod
- Updated dependencies [17ce29e5]
  - @blitzjs/generator@2.0.0-alpha.31
  - blitz@2.0.0-alpha.31

## 2.0.0-alpha.30

### Patch Changes

- ce453683: Add codemod to upgrade from legacy framework to the Blitz Toolkit
- ce453683: init codemod generator
- Updated dependencies [ce453683]
  - blitz@2.0.0-alpha.30
  - @blitzjs/generator@2.0.0-alpha.30
