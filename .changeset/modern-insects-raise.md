---
"@blitzjs/auth": patch
"blitz": patch
---

Remove unintended dependency on next-auth by removing it from the core build of @blitzjs/auth

⚠️ Breaking Change for current users of `withNextAuthAdapter`

Update your import in `next.config.js` in the following way
```diff
-const { withNextAuthAdapter } = require("@blitzjs/auth")
+const { withNextAuthAdapter } = require("@blitzjs/auth/next-auth")
