---
"@blitzjs/auth": patch
"@blitzjs/rpc": patch
"blitz": patch
---

- Introduce Blitz RPC's logging system to the `invoke` function which is the recommended way to call resolvers in nextjs `app` directory's react server components.

- This refactor also removes the re-introduced dependency between `blitz-auth` and `blitz-rpc`, allowing independent usage of `blitz-rpc`
