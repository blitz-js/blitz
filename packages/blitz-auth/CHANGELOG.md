# @blitzjs/auth

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
