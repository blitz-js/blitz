---
"blitz": patch
"@blitzjs/generator": patch
---

Fix `cannot find module db error` in JavaScript template. Replaced requiring the config using `esbuild` instead paring the AST to get the `cliConfig`. Allow added option 
to find the `blitz-server` file in `src` directory for this logic.
