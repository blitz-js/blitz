---
"@blitzjs/generator": patch
---

Remove `-cookie-prefix` appended to the cookiePrefix string in the generator template. This will also fix auth and CSRF issues for people upgrading.
