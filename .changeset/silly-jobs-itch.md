---
"blitz": minor
"@blitzjs/next": minor
"@blitzjs/rpc": minor
---

Turbopack support for Blitz

This PR includes the changes required to make the Blitz loaders work with Turbopack.

Usage:

```ts
//next.config.js
const nextConfig = {
  blitz: {
    turbo: true,
  },
}

module.exports = withBlitz(nextConfig)
```
