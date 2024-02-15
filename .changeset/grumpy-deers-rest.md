---
"@blitzjs/auth": patch
---

fix: remove restriction to use `secure` cookies in localhost / during development following spec in [developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies) regarding usage of secure cookies
