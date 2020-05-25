# The Rules of BlitzJS 🚀

Rules are Plugins to the BlitzJS system. They manage how the [NextJS](https://nextjs.org/) app is generated from your BlitzJS app space and leverage streams to quickly generate files

## Config

Transforms blitz.config.js into next.config.js and ensures that the business rules are correct.

```diff
- blitz.config.js
+ next.config.js
```

## Manifest

Creates a file error manifest for errors displayed in the browser that redirects errors from the generated app to the original source files.

## Pages

Assemble a single /pages folder from the BlitzJS folder structure.

```diff
- app/products/pages/index.tsx
+ app/pages/products.html
```

## Relative

Converts relative file paths to absolute file paths.

```diff
app/products/pages/products/index.tsx
- import getProducts from '../../queries/getProducts'
+ import getProducts from 'app/products/queries/getProducts'
```

## RPC

Generates the internal RPC commands and handlers when you use a query or mutation in your client components to talk to the server-side.

RPCs are handled in an isomorphic fashion; the same query/mutation can execute from client code or from server code. Queries/mutations called from the client-side will invoke `window.fetch()` onto the RPC API. Server-side query calls will invoke the query/mutation directly.

## Write

[Gulp](https://gulpjs.com/) plugin to send the Vinyl files to their destinations. This should be refactored into a helper

# How to Add a Rule

TODO...
