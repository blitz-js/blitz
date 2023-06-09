---
"@blitzjs/rpc": patch
---

Fixes enormous memory consumption of the dev server by changing the default import strategy to "require" instead of "import" which in webpack causes multiple chunks to be created for each import.

## Blitz Configuration

To configure this behaviour, you can add the following to your next.config.js:

```js
/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  blitz: {
    resolversDynamicImport: true,
  },
}
```

When `resolversDynamicImport` is set to `true`, the import strategy will be "import" instead of "require".

### On Vercel

If you are using Vercel, `resolversDynamicImport` will be set to `true` by default, since it is better for the separate chunks to be create for serverless lambdas.
