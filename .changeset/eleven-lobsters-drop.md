---
"@blitzjs/generator": patch
---

Fix `no-floating-promises` lint errors after generating pages with Blitz generator by adding `await` to `router.push` calls in the templates
