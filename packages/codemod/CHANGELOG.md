# @blitzjs/codemod

## 3.0.0

### Patch Changes

- Updated dependencies [3b10b13e6]
  - blitz@2.1.0
  - @blitzjs/generator@3.0.0

## 2.0.10

### Patch Changes

- Updated dependencies [318e9740d]
  - blitz@2.0.10
  - @blitzjs/generator@2.0.10

## 2.0.9

### Patch Changes

- Updated dependencies [5a14306f7]
  - blitz@2.0.9
  - @blitzjs/generator@2.0.9

## 2.0.8

### Patch Changes

- Updated dependencies [5e61a1681]
- Updated dependencies [77555468f]
  - blitz@2.0.8
  - @blitzjs/generator@2.0.8

## 2.0.7

### Patch Changes

- Updated dependencies [ee7bf87ec]
- Updated dependencies [178c152b2]
  - blitz@2.0.7
  - @blitzjs/generator@2.0.7

## 2.0.6

### Patch Changes

- Updated dependencies [76a2544f9]
  - blitz@2.0.6
  - @blitzjs/generator@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [6f54841b7]
  - blitz@2.0.5
  - @blitzjs/generator@2.0.5

## 2.0.4

### Patch Changes

- f25aac08c: Added support to codemod upgrade-legacy for projects that have their pages folder nested in a src/ folder
- Updated dependencies [dd604c767]
- Updated dependencies [71b995003]
- Updated dependencies [28a79040e]
  - blitz@2.0.4
  - @blitzjs/generator@2.0.4

## 2.0.3

### Patch Changes

- 956a739e8: codemod: provide correct path to new template paths
- Updated dependencies [47722e045]
- Updated dependencies [2f5c8a3a0]
- Updated dependencies [595f400e9]
  - @blitzjs/generator@2.0.3
  - blitz@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies [e8fd12e4f]
  - blitz@2.0.2
  - @blitzjs/generator@2.0.2

## 2.0.1

### Patch Changes

- 8782aae64: Fix outdated code in npm caused in during exit to stable release
- Updated dependencies [8782aae64]
  - blitz@2.0.1
  - @blitzjs/generator@2.0.1

## 2.0.0

### Minor Changes

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

### Patch Changes

- db7233db6: Bump react, react-dom, @types/react and next versions

  This fixes a console warning: `Warning: Received`true`for a non-boolean attribute`global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.

- 06427f67f: Throw error if cookiePrefix is undefined when running codemod
- dcdcd0405: These are various changes to will make the codemod more dynamic and work with a larger variety of codebases. These fixes are implemented to make the codemod work with flightdeck.
- f120f6723: Add DocumentProps & DocumentContext to the codemod import map
- 86af6dec5: Wrap middlewares with BlitzServerMiddleware function with codemod
- d3403cf86: Show file path on error when running the upgrade legacy codemod.
- 74a4ce8e8: Add `AuthenticatedSessionContext` to the `upgrade-legacy` codemod import map
- e3750b049: codemod fixes
- 43e65cfec: Remove TypeScript type annotations from `next.config.js` (a JavaScript file) in the `upgrade-legacy` codemod.
- a3b5fdd03: Change ES6 import for `withBlitz` during the codemod to the require syntax.
- bbac7906e: fix codemod for wrapping \_app arrow function & fix codemod for nested pages directory
- 4cad9cca2: Update queryClient import in codemod
- 1476a577b: Fix release
- da914c929: Convert import statements to require when creating the next.config.js file in the codemod
- f88702c1c: Remove trailing comma when removing BlitzConfig from next.config.js & Fix codemod so if route (eg. `app/auth/pages`) convert to (eg. `pages/`) instead of (eg. `pages/auth`)
- aafdc5b4c: Move middlewares from blitz config to blitz server with codemod
- 93851d90c: Handle duplicate imports with Blitz upgrade-legacy codemod
- b3b4c2150: Unwrap `invokeWithMiddleware` so the query or mutation is called directly when running the codemod
- e6fb09d49: Fix templates source in RPC codemod step
- ce4536833: Add codemod to upgrade from legacy framework to the Blitz Toolkit
- 2313fa61b: Fix upgrade-legacy codemod replacing identifiers with an invalid value. Previously new values were hardcoded to `NextApiRequest`. Now we're using correct values provided as `replaceIdentifiers` function argument.
- 72a332e01: Wrap `blitz.config.ts` with the `withBlitz` function during the codemod step instead of creating a blank `next.config.js` file.
- 0f4926fd1: Set current Blitz tag to latest
- 70f9ae492: Handle next/dynamic default import in codemod
- 7e538ba45: Import ErrorComponent as DefaultErrorComponent
- 8aee25c58: getQueryClient function & queryClient codemod updates & shared plugin config
- 8e00605a8: Updates the error messages based on if it's a babel parse error or an unexpected error
- 2d1482fc8: Allow codemod to finish if `cookiePrefix` is undefined. Then show error at the end of running the codemod.
- eb970f7bb: Fix detecting `blitz.config.(ts|js)` config file when running the codemod.
- 1bf185d61: Add a new codemod step to update the .eslintrc.js file
- 8dfaad088: Set correct packages versions in package.json with upgrade-legacy codemod
- ce4536833: init codemod generator
- 9e05d6e15: allow extension catch in getAllFiles codemod util
- cb55ed266: Fix codemod to accept a self closing `DocumentHead` in the `_document` page
- ebfb562bf: Add `Script` as a default import from next.js during the codemod.
- 46d9f81ad: Update templates directory for codemod
- 2cc888eff: Beta release
- Updated dependencies [db7233db6]
- Updated dependencies [1569bd53e]
- Updated dependencies [cee2dec17]
- Updated dependencies [cb63a0ea5]
- Updated dependencies [c5c727cb6]
- Updated dependencies [5166e5e03]
- Updated dependencies [047302055]
- Updated dependencies [9db6c8855]
- Updated dependencies [1e1bb73b2]
- Updated dependencies [83b355900]
- Updated dependencies [4656e6ecd]
- Updated dependencies [c1e004063]
- Updated dependencies [365e67094]
- Updated dependencies [fd31e56bc]
- Updated dependencies [74a14b704]
- Updated dependencies [91aa53563]
- Updated dependencies [e228ba5de]
- Updated dependencies [aec1bb076]
- Updated dependencies [1e0ec7a97]
- Updated dependencies [77b7da0f3]
- Updated dependencies [47c6b62dc]
- Updated dependencies [547613937]
- Updated dependencies [82649f341]
- Updated dependencies [f397cc203]
- Updated dependencies [cadefb88e]
- Updated dependencies [271c58ac6]
- Updated dependencies [8f166a5db]
- Updated dependencies [8c247e26e]
- Updated dependencies [c5572bec6]
- Updated dependencies [86e8eb7c8]
- Updated dependencies [99205f52d]
- Updated dependencies [6ece09613]
- Updated dependencies [e3750b049]
- Updated dependencies [824a9b5e2]
- Updated dependencies [4603a2b7b]
- Updated dependencies [d6717b9d3]
- Updated dependencies [928e840b5]
- Updated dependencies [6ac2d3412]
- Updated dependencies [6f18cbdc9]
- Updated dependencies [7498aef4f]
- Updated dependencies [2a81af7b7]
- Updated dependencies [ea7561b8e]
- Updated dependencies [1436e7618]
- Updated dependencies [176c7b8b5]
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
- Updated dependencies [b80c3d92c]
- Updated dependencies [b72d1215c]
- Updated dependencies [cacb65d63]
- Updated dependencies [eb9715688]
- Updated dependencies [630c71812]
- Updated dependencies [bf1b2c824]
- Updated dependencies [240f3f347]
- Updated dependencies [4cad9cca2]
- Updated dependencies [55b1cb204]
- Updated dependencies [c89cb943b]
- Updated dependencies [54db8a46d]
- Updated dependencies [bf4aaf1de]
- Updated dependencies [962eb58af]
- Updated dependencies [54a66a95d]
- Updated dependencies [9fe0cc546]
- Updated dependencies [b43c1a81c]
- Updated dependencies [0b94a4503]
- Updated dependencies [af58e2b23]
- Updated dependencies [78fd5c489]
- Updated dependencies [62bf12b5c]
- Updated dependencies [6ff9ec0d7]
- Updated dependencies [09e0c68db]
- Updated dependencies [abb1ad5d1]
- Updated dependencies [3a602b613]
- Updated dependencies [ceb7db274]
- Updated dependencies [2ade7268e]
- Updated dependencies [0edeaa37a]
- Updated dependencies [f0ca738d5]
- Updated dependencies [7aef610d8]
- Updated dependencies [0936cb38a]
- Updated dependencies [c11f0401c]
- Updated dependencies [60de05747]
- Updated dependencies [ab4d9de70]
- Updated dependencies [989691ec8]
- Updated dependencies [4d7d126d9]
- Updated dependencies [8e5903c0f]
- Updated dependencies [30fd61316]
- Updated dependencies [6f4349896]
- Updated dependencies [6baab1907]
- Updated dependencies [942536d9a]
- Updated dependencies [8ada2c26f]
- Updated dependencies [666a3ae3e]
- Updated dependencies [a80d2a8f7]
- Updated dependencies [3ddb57072]
- Updated dependencies [4e26ae21b]
- Updated dependencies [430f0b52d]
- Updated dependencies [abe2afccd]
- Updated dependencies [b84c5bedb]
- Updated dependencies [a6f32d1d0]
- Updated dependencies [b97366c42]
- Updated dependencies [e339e2fd0]
- Updated dependencies [348fd6f5e]
- Updated dependencies [3bcbad1a9]
- Updated dependencies [0a8b0cb35]
- Updated dependencies [8490b0724]
- Updated dependencies [22344d058]
- Updated dependencies [19898a488]
- Updated dependencies [93851d90c]
- Updated dependencies [6811eab1a]
- Updated dependencies [81b4b41a9]
- Updated dependencies [d814c2d2d]
- Updated dependencies [20fc9f80f]
- Updated dependencies [8dedca1a2]
- Updated dependencies [3511d5b69]
- Updated dependencies [46a34c7b3]
- Updated dependencies [e82a79be5]
- Updated dependencies [890b0c0c9]
- Updated dependencies [430f6ec78]
- Updated dependencies [a961aff88]
- Updated dependencies [83281a846]
- Updated dependencies [6ec020c6d]
- Updated dependencies [adabb11a0]
- Updated dependencies [38d945a3f]
- Updated dependencies [c3c789740]
- Updated dependencies [240f378b5]
- Updated dependencies [6d5f9efe1]
- Updated dependencies [df3265b85]
- Updated dependencies [b1ef45bf2]
- Updated dependencies [89bf993a1]
- Updated dependencies [0f4926fd1]
- Updated dependencies [3f9fe8f04]
- Updated dependencies [bcef81fad]
- Updated dependencies [8aee25c58]
- Updated dependencies [fe8c937d2]
- Updated dependencies [0ac6e1712]
- Updated dependencies [35a070ad7]
- Updated dependencies [8fa9a56f6]
- Updated dependencies [807a2b564]
- Updated dependencies [1d9804a61]
- Updated dependencies [41608c4c3]
- Updated dependencies [a0596279b]
- Updated dependencies [88caa18e6]
- Updated dependencies [022392c12]
- Updated dependencies [ebd74b4e9]
- Updated dependencies [63605961b]
- Updated dependencies [c53978d58]
- Updated dependencies [17ce29e5e]
- Updated dependencies [c126b8191]
- Updated dependencies [c9cf7adc3]
- Updated dependencies [1b798d9a0]
- Updated dependencies [ea7561b8e]
- Updated dependencies [a84b8de4e]
- Updated dependencies [727734955]
- Updated dependencies [70b334a2f]
- Updated dependencies [80e1ead7c]
- Updated dependencies [f39ba1ff1]
- Updated dependencies [161270e3b]
- Updated dependencies [b6b9a1c5a]
- Updated dependencies [b405c1e87]
- Updated dependencies [37623a4f4]
- Updated dependencies [dd299ae89]
- Updated dependencies [8bcb471a5]
- Updated dependencies [a3e6c49c4]
- Updated dependencies [15d22af24]
- Updated dependencies [454591293]
- Updated dependencies [b86b569d5]
- Updated dependencies [bd09db753]
- Updated dependencies [2073714f8]
- Updated dependencies [d316d0db7]
- Updated dependencies [8aa22a0b2]
- Updated dependencies [12cb7a727]
- Updated dependencies [37aeaa7fa]
- Updated dependencies [b918055bf]
- Updated dependencies [aa34661fa]
- Updated dependencies [61888d1a3]
- Updated dependencies [dd5f51744]
- Updated dependencies [ce4536833]
- Updated dependencies [79c5e86d7]
- Updated dependencies [fb32903bf]
- Updated dependencies [b33db0828]
- Updated dependencies [f15a51901]
- Updated dependencies [10f98c681]
- Updated dependencies [9674efc0b]
- Updated dependencies [8e0c9d76b]
- Updated dependencies [d5b8faa86]
- Updated dependencies [a3bbe6ce3]
- Updated dependencies [7abfb9086]
- Updated dependencies [e2c18895d]
- Updated dependencies [00bd849ee]
- Updated dependencies [ffa7b5ccc]
- Updated dependencies [065db256d]
- Updated dependencies [1f6b0b54c]
- Updated dependencies [527e48ac3]
- Updated dependencies [078fe4741]
- Updated dependencies [01f3a03ea]
- Updated dependencies [36e26193b]
- Updated dependencies [2cc888eff]
- Updated dependencies [8107138e2]
- Updated dependencies [f202aac18]
  - blitz@2.0.0
  - @blitzjs/generator@2.0.0

## 2.0.0-beta.37

### Patch Changes

- Updated dependencies [86e8eb7c8]
- Updated dependencies [b84c5bedb]
- Updated dependencies [6d5f9efe1]
  - blitz@2.0.0-beta.37
  - @blitzjs/generator@2.0.0-beta.37

## 2.0.0-beta.36

### Patch Changes

- Updated dependencies [09e0c68db]
  - blitz@2.0.0-beta.36
  - @blitzjs/generator@2.0.0-beta.36

## 2.0.0-beta.35

### Patch Changes

- Updated dependencies [cee2dec17]
- Updated dependencies [aec1bb076]
- Updated dependencies [c89cb943b]
- Updated dependencies [b97366c42]
- Updated dependencies [3bcbad1a9]
  - blitz@2.0.0-beta.35
  - @blitzjs/generator@2.0.0-beta.35

## 2.0.0-beta.34

### Patch Changes

- Updated dependencies [30fd61316]
- Updated dependencies [3ddb57072]
- Updated dependencies [fe8c937d2]
  - blitz@2.0.0-beta.34
  - @blitzjs/generator@2.0.0-beta.34

## 2.0.0-beta.33

### Patch Changes

- Updated dependencies [19898a488]
- Updated dependencies [6811eab1a]
- Updated dependencies [022392c12]
  - blitz@2.0.0-beta.33
  - @blitzjs/generator@2.0.0-beta.33

## 2.0.0-beta.32

### Patch Changes

- Updated dependencies [47c6b62dc]
- Updated dependencies [82649f341]
  - @blitzjs/generator@2.0.0-beta.32
  - blitz@2.0.0-beta.32

## 2.0.0-beta.31

### Patch Changes

- Updated dependencies [90f1741da]
- Updated dependencies [df3265b85]
  - blitz@2.0.0-beta.31
  - @blitzjs/generator@2.0.0-beta.31

## 2.0.0-beta.30

### Patch Changes

- Updated dependencies [c5572bec6]
- Updated dependencies [727734955]
  - blitz@2.0.0-beta.30
  - @blitzjs/generator@2.0.0-beta.30

## 2.0.0-beta.29

### Patch Changes

- Updated dependencies [7aef610d8]
- Updated dependencies [b6b9a1c5a]
- Updated dependencies [61888d1a3]
  - @blitzjs/generator@2.0.0-beta.29
  - blitz@2.0.0-beta.29

## 2.0.0-beta.28

### Patch Changes

- Updated dependencies [5166e5e03]
  - blitz@2.0.0-beta.28
  - @blitzjs/generator@2.0.0-beta.28

## 2.0.0-beta.27

### Patch Changes

- Updated dependencies [d814c2d2d]
  - @blitzjs/generator@2.0.0-beta.27
  - blitz@2.0.0-beta.27

## 2.0.0-beta.26

### Patch Changes

- Updated dependencies [e82a79be5]
- Updated dependencies [38d945a3f]
  - blitz@2.0.0-beta.26
  - @blitzjs/generator@2.0.0-beta.26

## 2.0.0-beta.25

### Patch Changes

- @blitzjs/generator@2.0.0-beta.25
- blitz@2.0.0-beta.25

## 2.0.0-beta.24

### Minor Changes

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

### Patch Changes

- Updated dependencies [e228ba5de]
- Updated dependencies [cadefb88e]
- Updated dependencies [6f18cbdc9]
- Updated dependencies [ea7561b8e]
- Updated dependencies [430f0b52d]
- Updated dependencies [ea7561b8e]
- Updated dependencies [37aeaa7fa]
  - @blitzjs/generator@2.0.0-beta.24
  - blitz@2.0.0-beta.24

## 2.0.0-beta.23

### Patch Changes

- Updated dependencies [cb63a0ea5]
- Updated dependencies [6ec020c6d]
- Updated dependencies [c3c789740]
- Updated dependencies [d316d0db7]
- Updated dependencies [79c5e86d7]
  - @blitzjs/generator@2.0.0-beta.23
  - blitz@2.0.0-beta.23

## 2.0.0-beta.22

### Patch Changes

- Updated dependencies [989691ec8]
- Updated dependencies [bcef81fad]
- Updated dependencies [8aa22a0b2]
- Updated dependencies [7abfb9086]
  - blitz@2.0.0-beta.22
  - @blitzjs/generator@2.0.0-beta.22

## 2.0.0-beta.21

### Patch Changes

- Updated dependencies [77b7da0f3]
- Updated dependencies [d692b4c1d]
- Updated dependencies [10f98c681]
- Updated dependencies [d5b8faa86]
  - @blitzjs/generator@2.0.0-beta.21
  - blitz@2.0.0-beta.21

## 2.0.0-beta.20

### Patch Changes

- Updated dependencies [74a14b70]
- Updated dependencies [8c247e26]
- Updated dependencies [6ece0961]
- Updated dependencies [a0596279]
  - blitz@2.0.0-beta.20
  - @blitzjs/generator@2.0.0-beta.20

## 2.0.0-beta.19

### Patch Changes

- Updated dependencies [c1e00406]
- Updated dependencies [696f48c4]
- Updated dependencies [b80c3d92]
- Updated dependencies [942536d9]
- Updated dependencies [a6f32d1d]
- Updated dependencies [c126b819]
- Updated dependencies [b33db082]
  - blitz@2.0.0-beta.19
  - @blitzjs/generator@2.0.0-beta.19

## 2.0.0-beta.18

### Patch Changes

- @blitzjs/generator@2.0.0-beta.18
- blitz@2.0.0-beta.18

## 2.0.0-beta.17

### Patch Changes

- Updated dependencies [2a81af7b]
- Updated dependencies [5ea068b2]
- Updated dependencies [8b4bf999]
- Updated dependencies [88caa18e]
  - @blitzjs/generator@2.0.0-beta.17
  - blitz@2.0.0-beta.17

## 2.0.0-beta.16

### Patch Changes

- Updated dependencies [1569bd53]
- Updated dependencies [ceb7db27]
- Updated dependencies [8e5903c0]
- Updated dependencies [45459129]
  - blitz@2.0.0-beta.16
  - @blitzjs/generator@2.0.0-beta.16

## 2.0.0-beta.15

### Patch Changes

- Updated dependencies [1b798d9a]
  - blitz@2.0.0-beta.15
  - @blitzjs/generator@2.0.0-beta.15

## 2.0.0-beta.14

### Patch Changes

- Updated dependencies [54761393]
- Updated dependencies [78fd5c48]
- Updated dependencies [60de0574]
- Updated dependencies [0a8b0cb3]
  - @blitzjs/generator@2.0.0-beta.14
  - blitz@2.0.0-beta.14

## 2.0.0-beta.13

### Patch Changes

- Updated dependencies [a6e81f15]
- Updated dependencies [6f434989]
- Updated dependencies [4e26ae21]
  - blitz@2.0.0-beta.13
  - @blitzjs/generator@2.0.0-beta.13

## 2.0.0-beta.12

### Patch Changes

- Updated dependencies [3a602b61]
- Updated dependencies [f39ba1ff]
  - blitz@2.0.0-beta.12
  - @blitzjs/generator@2.0.0-beta.12

## 2.0.0-beta.11

### Patch Changes

- 1476a577: Fix release
- Updated dependencies [1476a577]
  - blitz@2.0.0-beta.11
  - @blitzjs/generator@2.0.0-beta.11

## 2.0.0-beta.10

### Patch Changes

- b3b4c215: Unwrap `invokeWithMiddleware` so the query or mutation is called directly when running the codemod
- eb970f7b: Fix detecting `blitz.config.(ts|js)` config file when running the codemod.
- Updated dependencies [04730205]
- Updated dependencies [9db6c885]
- Updated dependencies [824a9b5e]
- Updated dependencies [d6717b9d]
- Updated dependencies [d98e4bac]
- Updated dependencies [bf4aaf1d]
- Updated dependencies [9fe0cc54]
- Updated dependencies [b43c1a81]
- Updated dependencies [af58e2b2]
- Updated dependencies [2ade7268]
- Updated dependencies [0edeaa37]
- Updated dependencies [430f6ec7]
- Updated dependencies [83281a84]
- Updated dependencies [15d22af2]
- Updated dependencies [bd09db75]
- Updated dependencies [aa34661f]
- Updated dependencies [8e0c9d76]
- Updated dependencies [e2c18895]
  - @blitzjs/generator@2.0.0-beta.10
  - blitz@2.0.0-beta.5

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
