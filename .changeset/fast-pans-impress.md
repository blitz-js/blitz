---
"@blitzjs/next": minor
---

Fix Next 13.2 compatibility

This updates the suspense patch to work with Next.js 13.2+. Hopefully soon we can stop patching once Next.js catches up with all the other frameworks and properly [exposes the `onRecoverableError` react hook](https://github.com/vercel/next.js/discussions/36641).
