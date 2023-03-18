---
"@blitzjs/auth": major
"@blitzjs/codemod": minor
---

## ⚠️ Breaking Changes for Blitz Auth

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
