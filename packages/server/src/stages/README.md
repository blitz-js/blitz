# Pipeline Stages for Blitz 🚀

These are the business rule transformations that are run on source files while in transit during a Blitz Start or a Blitz Build.

Each folder represents a business rule and should be separately applicable and not depend on each other.

These live here because of their dependencies and to keep [@blitzjs/file-pipeline](../../../file-pipeline/README.md) a general utility.

The current rules are summarized below. For more information, see [@blitzjs/file-pipeline](../../../file-pipeline/README.md).

## [Config](./config/index.ts)

Transforms blitz.config.js into next.config.js and ensures that the business rules are correct.

```diff
- blitz.config.js
+ next.config.js
```

## [Manifest](./manifest/index.ts)

Creates a file error manifest for errors displayed in the browser that redirects errors from the generated app to the original source files.

## [Pages](./pages/index.ts)

Assemble a single /pages folder from the BlitzJS folder structure.

```diff
- app/products/pages/index.tsx
+ app/pages/products.html
```

## [Relative](./relative/index.ts)

Converts relative file paths to absolute file paths.

```diff
app/products/pages/products/index.tsx
- import getProducts from '../../queries/getProducts'
+ import getProducts from 'app/products/queries/getProducts'
```

## [RPC](./rpc/index.ts)

Generates the internal RPC commands and handlers when you use a query or mutation in your client components to talk to the server-side.

RPCs are handled in an isomorphic fashion; the same query/mutation can execute from client code or from server code. Queries/mutations called from the client-side will invoke `window.fetch()` onto the RPC API. Server-side query calls will invoke the query/mutation directly.
