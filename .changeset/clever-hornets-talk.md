---
"blitz": patch
"@blitzjs/next": patch
"@blitzjs/generator": patch
---

Upgrade tslog to `4.9.0`.

This due a [tslog issue](https://github.com/fullstack-build/tslog/issues/227) that causes tslog to crash when attempting to log an error whose constructor expects more than one argument.
