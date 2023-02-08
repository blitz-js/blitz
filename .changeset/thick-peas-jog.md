---
"@blitzjs/auth": major
---

BREAKING CHANGE: secure-password is now an `optional peerDependency`, if you are using `SecurePassword` api, you need to now install `secure-password` in your application.

This helps users who do not use SecurePassword from having native package build issues.
