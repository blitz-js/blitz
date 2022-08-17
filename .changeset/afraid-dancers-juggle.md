---
"blitz": patch
"@blitzjs/auth": patch
"@blitzjs/next": patch
"@blitzjs/rpc": patch
"@blitzjs/codemod": patch
"@blitzjs/config": patch
"@blitzjs/generator": patch
---

Bump react, react-dom, @types/react and next versions

This fixes a console warning: `Warning: Received `true` for a non-boolean attribute `global`.` when using `styled-jsx`. Versions bump also fixes React Hydration error that happens on and off when using `redirectAuthenticatedTo`.
