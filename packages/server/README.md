# `@blitzjs/server`

Responsible for managing the development and production server for Blitz.

The Server package exposes some key functions for controlling blitz.

## `dev()`

Start the development server in watch mode.

```ts
import {dev} from "@blitzjs/server"

await dev(serverConfig)
```

## `prod()`

Start the production server.

```ts
import {prod} from "@blitzjs/server"

await prod(serverConfig)
```

_This readme needs more work. If you want to help out please submit a PR_
