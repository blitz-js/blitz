---
"blitz": patch
---

Patch Next.js Suspense issue in all node environments. Previously we only patched it in the `development` environment, but now we make sure it gets patched in the `production` env (with the `blitz build` command) as well.
