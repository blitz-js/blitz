---
"@blitzjs/auth": major
"@blitzjs/codemod": minor
---

## ⚠️ Breaking Changes for Blitz Auth

Automatically upgrade (Make sure to git commit before running this command to avoid losing changes)

```bash
npx @blitz/codemod secure-password
```

Introduce a new path to import the Blitz wrappers `SecurePassword` to fully decouple the library from `@blitzjs/auth`

```diff
- import {SecurePassword} from "@blitzjs/auth"
+ import {SecurePassword} from "@blitzjs/auth/secure-password"
```
