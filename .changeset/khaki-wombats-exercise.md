---
"eslint-config-blitz-next": minor
---

Moves the eslint config from the `@blitzjs/next` package to a separate package to allow easier use and extension of eslint configuration.

```diff
- module.exports = require("@blitzjs/next/eslint")

+ module.exports = {
+    "extends": "blitz-next",
+    "rules": {
+        // enable additional rules
+
+    }
+}
```
