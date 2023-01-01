---
"blitz": minor
"@blitzjs/auth": patch
---

Truncate errors from `api/auth/<strategy>/callback` request to 100 characters before passing them to the `?authError=` query parameter
