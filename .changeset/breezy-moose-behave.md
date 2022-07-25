---
"blitz": minor
"@blitzjs/auth": patch
---

Error messages representing errors that are thrown while handling the `api/auth/<strategy>/callback` request, will be truncated to a maximum of 100 characters before being passed as to the `?authError=` query parameter of the redirectUrl.
