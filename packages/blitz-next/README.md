[![Blitz.js](https://raw.githubusercontent.com/blitz-js/art/master/github-cover-photo.png)](https://blitzjs.com)

<!-- prettier-ignore-start -->
<p align="center">
  <a aria-label="Join our Discord Community" href="https://discord.blitzjs.com">
    <img alt="" src="https://img.shields.io/badge/Join%20our%20community-6700EB.svg?style=for-the-badge&labelColor=000000&logoWidth=20&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQ9SURBVHgB7d3dVdtAEIbhcSpICUoH0IEogQqSVBBSAU4FSSpIOoAORAfQgSghHXzZ1U/YcMD4R9rZmf2ec3y448LyiNf27iLiGIAmPLrweC9Un3DhrzG6EarLNP09nlwJ1SOZ/lQr5N80/S/p2QMVCBf5N17XCfm1Y/rBHqjAG9PPHvBsz+mf9WAP+HLA9M/YA14cOP2payH7jpj+VCtk1wnTP+vj7xCy6cTpn7EHLMLp059iD1iD8eveJbVCNsSLheX1YA/YgOWnf8YeKB3Wmf7Ud6Fy4f/FHmtpxbl3YlC4MJ/Cj0bWdwPnPbARg+L0S54XQHS32WwuxClzd4CM0z9rPfeAuTtA5ulPXYQ7wZ04Y+oOoDD9KZc9YOoOoDj9s4dwFzgXR6w1wIPoOvPWA9buAHEJ173o3gWiy3AnuBUHLEbgmYwvAk1/wuM8vAgexThzbwPDkx7/DHwVXfFOxP2GmsKd4Ab6zPeAyU8CI7AHFmH2BRCBPXAyk18GzUrqAXCTiR4ssyj0VFw/oCU8+e+RZ33AWz6KMaYbIIWxB+JSLs1bsbkeMN0AqakHvoku9oA2sAfqBvbAQdw0QArsgb25aYBUQT3QgT2gB+yBuqGcHij2UCqXDZACe2Anlw2QYg/QAOyBuoE98CL3DZDCuK4/rh/Q7oGL6U+TOvcNkJoijN8X1C48+T+g75eQDrAH/qmqAVJgDwyqaoAUe4AGYA/UDZX3QLUNkEIZPRCd5+6BahsgVUgPROwBTSijB7jpVAvGHriHvmw9wAZ4BpX1ABvgmakHtPcbRuwBTWAPULgAV9D/jKDY9YRvwvgEaurD44uQHvAol7qBW7WKluVtIHiUS7GyvA0s6CiXDnxrpQfsgbqBS7GKk/2jYHCrVlGyfxTMrVo0ALdq1Q3sgSKofh0M9oA61a+D2QM0AHugbmAPqClmSRjK2apVVQ8UsySsoK1aHdgDesCtWnUDeyCrIpeFg1u3sylyWTi3btMA7IG6gT2wuuK3hoE9sKrit4YVslWLPaAN7IG6ocKt2zmY2h4O9sDiTG0PZw/QANy6XTewBxZj9ogYVHy025LMHhEz9cBn0We6B0yfERReBLfhx0/R1YQHPx/QBPbA0VwcEwf2wNFcHBPHHjiem3MC2QPHcXdSaJjA+KfgTPQ8hhfjBzHC40mhlzJ+Xq9lK4a4PCs43AVaGTed5mZq+iOXZwWHi3AnOj2wFWNcnxYe7gTxLtBKHuamP/J+Wnh8a5irB7ZC5Yk9gPX1QuXC+usHWqGyhYvUYR0a7zboUOFCNVhnk0krZAOW7wFOvzXhom2xnEbIHizTA1wEYhWW6YFGyC6c1gOcfg9wfA80Qj7g8B7g9HuCww+haIR8wf49wOn3Cvv9k8tGyC/s7gFOv3fY3QONkH+v9MBWqB7PeqDn9FcIT//kcitUn6kHOu/T/xfWzlQy3dEHhwAAAABJRU5ErkJggg==">
  </a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a aria-label="All Contributors" href="#contributors-"><img alt="" src="https://img.shields.io/badge/all_contributors-403-17BB8A.svg?style=for-the-badge&labelColor=000000"></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
  <a aria-label="License" href="https://github.com/blitz-js/blitz/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/npm/l/blitz.svg?style=for-the-badge&labelColor=000000&color=blue">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@blitzjs/next">
    <img alt="" src="https://img.shields.io/npm/v/blitz.svg?style=for-the-badge&labelColor=000000&color=E65528">
  </a>
</p>
<!-- prettier-ignore-end -->

<br>

<h1 align="center">
Blitz Adapter for Next.js
</h1>

<br>

### [Blitzjs Website](https://blitzjs.com)

### [GitHub](https://github.com/blitz-js/blitz/tree/main/packages/blitz-next)

## Overview

The `@blitzjs/next` adapter exposes functions & components specific for
the Next.js framework.

## Setup

You can install `@blitzjs/next` by running the following command:

```bash
npm i @blitzjs/next # yarn add @blitzjs/next # pnpm add @blitzjs/next
```

### Next Config

Blitz.js extends the `next.config.js` file by accepting a `blitz`
property.

```ts
blitz?: {
  resolverPath?: ResolverPathOptions;
  customServer?: {
      hotReload?: boolean;
  };
};
```

<Card type="note">
  For more information on setting a custom `resolverPath`, read more at
  the [RPC Specification](/docs/rpc-specification#url)
</Card>

## Client

### Example

Inside `src/blitz-client.ts`:

```ts
import {setupBlitzClient} from "@blitzjs/next"

export const {withBlitz} = setupBlitzClient({
  plugins: [],
})
```

Then inside `src/pages/_app.tsx` wrap `MyApp` function with the
`withBlitz` HOC component.

```ts
import {ErrorFallbackProps, ErrorComponent, ErrorBoundary} from "@blitzjs/next"
import {AuthenticationError, AuthorizationError} from "blitz"
import type {AppProps} from "next/app"
import React, {Suspense} from "react"
import {withBlitz} from "src/blitz-client"

function RootErrorFallback({error}: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    )
  }
}

function MyApp({Component, pageProps}: AppProps) {
  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

export default withBlitz(MyApp)
```

<Card type="note">
  An `<ErrorBoundary />` provider and `<ErrorComponent />` component is
  supplied by `@blitzjs/next`
</Card>

### API

```ts
setupBlitzClient({
  plugins: [],
})
```

#### Arguments

- `plugins:` An array of Blitz.js plugins
  - **Required**

#### Returns

An object with the `withBlitz` HOC wrapper

## Server

### Example

Inside `src/blitz-server.ts`

```ts
import {setupBlitzServer} from "@blitzjs/next"

export const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [],
})
```

### API

```ts
setupBlitzServer({
  plugins: [],
  onError?: (err) => void
})
```

#### Arguments

- `plugins:` An array of Blitz.js plugins
  - **Required**
- `onError:` Catch all errors _(Great for services like sentry)_

#### Returns

An object with the [`gSSP`](#blitzjs-next-gssp),
[`gSP`](#blitzjs-next-gsp) & [`api`](#blitzjs-next-api) wrappers.

### Custom Server

The Blitz CLI supports running custom Next.js servers. This means you can
compile both javascript & typescript while using the Blitz.js CLI to
inject env variables. By default, the CLI checks for
`src/server/index.[ts | js]` or `src/server.[ts | js]`

For more information about custom Next.js servers, check the
[`official docs`](https://nextjs.org/docs/advanced-features/custom-server)

## Wrappers

All Next.js wrapper functions are serialized with
[`superjson`](https://github.com/blitz-js/superjson). That means you can
use `Date`, `Map`, `Set` & `BigInt` when returning data. Another thing to
note is that Blitz runs the middlewares from plugins before calling the
Next.js request handler.

<Card type="note">
  The `gSSP`, `gSP` & `api` functions all pass down the context of the
  session if you're using the auth plugin. Read more about the auth plugin
  here [@blitzjs/auth](/docs/auth).
</Card>

### Examples

#### getStaticProps

```ts
import {gSP} from "src/blitz-server"

export const getStaticProps = gSP(async ({ctx}) => {
  return {
    props: {
      data: {
        userId: ctx?.session.userId,
        session: {
          id: ctx?.session.userId,
          publicData: ctx?.session.$publicData,
        },
      },
    },
  }
})
```

#### getServerSideProps

```ts
import {gSSP} from "src/blitz-server"

export const getServerSideProps = gSSP(async ({ctx}) => {
  return {
    props: {
      userId: ctx?.session.userId,
      publicData: ctx?.session.$publicData,
    },
  }
})
```

#### api

```ts
import {api} from "src/blitz-server"

export default api(async (req, res, ctx) => {
  res.status(200).json({userId: ctx?.session.userId})
})
```

_For more information about Next.js API routes, visit their docs at
[https://nextjs.org/docs/api-routes/introduction](https://nextjs.org/docs/api-routes/introduction)_

## Concepts

### Authenticate user before page loads

You may want to check if the user is logged in before your page loads.
We’re going to use the `getCurrentUser` query inside
`getServerSideProps()` by calling the query directly. Then you can check
if the user is logged in on the server and use the built-in Next.js
redirect property.

```ts
import {Routes, BlitzPage} from "@blitzjs/next"
import {gSSP} from "src/blitz-server"
import getCurrentUser from "src/users/queries/getCurrentUser"

export const getServerSideProps = gSSP(async ({ctx}) => {
  const currentUser = await getCurrentUser(null, ctx)

  if (currentUser) {
    return {
      props: {
        user: currentUser,
      },
    }
  } else {
    return {
      redirect: {
        destination: Routes.LoginPage(),
        permanent: false,
      },
    }
  }
})
```

### Return types when data fetching on the server

You can set the types returned from the Next.js data fetching functions.
All Blitz.js wrappers for the Next.js functions accept a generic. Same
with the `BlitzPage` type.

So for example, we can use some typescript utilities to help use get the
types returned by `getCurrentUser()`

```ts
import {Routes, BlitzPage} from "@blitzjs/next"
import {gSSP} from "src/blitz-server"
import getCurrentUser from "src/users/queries/getCurrentUser"

type TCurrentUser = Awaited<ReturnType<typeof getCurrentUser>>

export const getServerSideProps = gSSP<{user: TCurrentUser}>(async ({ctx}) => {
  const currentUser = await getCurrentUser(null, ctx)

  if (currentUser) {
    return {
      props: {
        user: currentUser,
      },
    }
  } else {
    return {
      redirect: {
        destination: Routes.LoginPage(),
        permanent: false,
      },
    }
  }
})

const Page: BlitzPage<{user: TCurrentUser}> = ({user}) => {
  return (
    <Layout title="Page">
      <div className="container">
        <p>User Page</p>
        {user && <p>{user.email}</p>}
      </div>
    </Layout>
  )
}

export default Page
```

### Handling errors on initial page load

There’s an edge case where you may be throwing an error in a query that’s
being called on an initial page load, causing a server error instead of
hitting the `<ErrorBoundary />`. This is because when initially loading
the page, there is no ErrorBoundary component rendered until `_app.tsx` is
mounted. Though, this is expected behaviour, there is a workaround.

For an example, in a query where the user is not found you can create a
`NotFoundError()` then return the status code.

```ts
export default resolver.pipe(resolver.zod(GetUser), async (input) => {
  const {id} = input

  const user = await db.user.findFirst({where: {id}})

  if (!user) {
    const userError = new NotFoundError("User not found")
    return {
      error: userError.statusCode,
    }
  } else {
    return {
      user,
    }
  }
})
```

Then on the server (in this case `getServerSideProps()`) you can call the
query and if the error key is found in the return object then show an
error.

```ts
export const getServerSideProps = gSSP(async ({ ctx }) => {

  const user = await getUser({ 1 }, ctx)
  if("error" in user) {
    return { props: { error: user.error}}
  } else {
    return { props: { user }}
  }
})
```

You can also catch server errors in `_app.tsx` and show the errors with a
toast component.

```tsx
function MyApp({Component, pageProps}: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)
  if (pageProps.error) {
    return <ToastComponent>{pageProps.error.statusCode}</ToastComponent>
  }
  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      {getLayout(<Component {...pageProps} />)}
    </ErrorBoundary>
  )
}
```
