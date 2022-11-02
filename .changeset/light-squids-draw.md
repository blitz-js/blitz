---
"blitz": patch
"@blitzjs/generator": patch
---

Fix `cannot find module db error` in JavaScript template. Replace requiring the config using `esbuild` with parsing using `jscodeshift` to get the `cliConfig` values. Added logic to find the `blitz-server` file in `src` directory 
