---
"blitz": patch
"@blitzjs/next": patch
"@blitzjs/generator": patch
---

Downgrade tslog to `4.7.4`.

This is a workaround for a [tslog issue](https://github.com/fullstack-build/tslog/issues/227) that causes tslog to crash when attempting to log an error whose constructor expects more than one argument.
