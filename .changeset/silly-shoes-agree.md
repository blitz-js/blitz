---
"@blitzjs/generator": patch
---

Remove `-cookie-prefix` appended to the `cookiePrefix` config property in the new app template. It will also fix auth and CSRF issues for users upgrading from a legacy framework.
