# [RFC] Blitz App Architecture

**The purpose of this RFC is to gather as much feedback as possible before building everything outlined below.**

**We welcome all feedback, whether good or bad! This is your chance to ensure Blitz meets the needs for your company or project.**

<hr/>

## Introduction

The central thesis for Blitz is most apps don't need a REST or GraphQL API. Blitz brings back the simplicity of server rendered frameworks like Ruby on Rails while preserving everything we love about React.

### What is Blitz Designed For?

Blitz is designed for tiny to large database-backed applications that have one or more graphical user interfaces.

Web support will be released first, followed by React Native. We are pursuing the dream of a single monolithic application that runs on web and mobile with maximum code sharing and minimal boilerplate.

### What are the Foundational Principles?

1. Fullstack & Monolithic
2. API Not Required
3. Convention over Configuration
4. Loose Opinions
5. Easy to Start, Easy to Scale
6. Stability
7. Community over Code

[The Blitz Manifesto](https://github.com/blitz-js/blitz/blob/canary/MANIFESTO.md) explains these principles in detail.

## Table of Contents

1. [Architecture Fundamentals](#1-architecture-fundamentals)
2. [User Interface](#2-user-interface)
3. [Data Schema](#3-data-schema)
4. [Computation](#4-computation)
   - A. [Queries](#a-queries)
   - B. [Mutations](#b-mutations)
   - C. [How the Heck Does That Work?](#c-how-the-heck-does-that-work)
   - D. [Composition](#d-composition)
   - E. [Auto Generated HTTP API](#e-auto-generated-http-api)
   - F. [Middleware](#f-middleware)
5. [File Structure and Routing](#5-file-structure-and-routing)
6. [Authentication](#6-authentication)
7. [Why not MVC?](#7-why-not-mvc)
8. [Why not GraphQL?](#8-why-not-graphql)
9. [Blitz is GraphQL Ready](#9-blitz-is-graphql-ready)
10. [SSR?](#10-ssr)
11. [Deployment Agnostic](#11-deployment-agnostic)
12. [Background Processing](#12-background-processing)
13. [Websockets?](#13-websockets)
14. [Summary](#14-summary)

## 1. Architecture Fundamentals

Database backed applications have three fundamental parts:

1. User Interface
2. Data schema
3. Computation

Everything else should be minimized as much as possible. This includes boilerplate, HTTP details, manually fetching data, etc.

## 2. User Interface

Blitz uses React and Next.js for the UI layer. Blitz provides a few conveniences on top of Next. But Blitz still gives you the raw power of Next.js to do anything you want. Including `getStaticProps`, `getServerSideProps`, `getInitialProps`, and custom API routes.

Under the hood, a Blitz app is compiled to a Next.js app for deployment. This gives us freedom to do things like use a totally different file structure that's better for fullstack apps.

## 3. Data Schema

Blitz is database agnostic. You are free to use anything at this layer, including something like TypeORM.

However, the recommended happy path is to use Prisma 2. Prisma 2 is a new type safe database client with schema management and migrations. It currently supports Postgres, MySQL, and SQLite, and it will be adding support for many others such as Mongo and DynamoDB.

### Data Validation

Validation is a key part of your data schema. Validation is needed both server-side and client-side. In a Blitz app, you define your validation rules one time, and then you can use them on both the server and the client.

The API for defining and using validation rules is TBD, but the plan is to integrate them with prisma client so all prisma client input is automatically validated. Also, you'll be able to directly plug validation rules into React form libraries like Formik.

### Authorization

Fine-grained authorization is another critical part of your data schema. In a Blitz app, you define your authorization rules one time, and then you can use them on both the server and the client.

The API for defining and using authorization rules is TBD, but the plan is to integrate them with prisma client so all all prisma client reads & writes are always automatically authorized.

## 4. Computation

The majority of computation in most apps is basic Create, Read, Update, and Delete (CRUD) operations. CRUD operations should be extremely simple and not require tons of boilerplate (if you've used GraphQL, you know how much boilerplate that requires!)

The most simple way to execute some computation is to directly call a function (vs making a fetch call, for example).

So we've designed Blitz queries and mutations to be invoked via direct function calls.

### A. Queries

Define a Blitz query by exporting a plain Javascript function. The first function argument can be anything you want. The second argument will be provided by Blitz when executed from the frontend.

The query function is always executed on the server, so you can safely read directly from the database.

```ts
// /some/path/getProduct.ts
import {Context} from 'blitz/types'
import db, {FindOneProductArgs} from 'db'

export default async function getProduct(args: FindOneProductArgs, ctx?: Context) {
  // Can do any pre-processing here or trigger events

  const product = await db.setUser(ctx.session.user).product.findOne(args)

  // Can do any post-processing here or trigger events

  return product
}
```

To use this query in your React component, you directly import the above query function and pass it to the `useQuery` hook. The second argument to `useQuery` will be the first argument to the query function.

The hook's input and output is fully typed. This would fail to compile if the `product` table in the database didn't have a `name` field.

```tsx
// pages/products/[id].tsx
import {useQuery} from 'blitz'
import getProduct from '/some/path/getProduct'

export default function(props: {query: {id: number}}) {
  const [product] = useQuery(getProduct, {where: {id: props.query.id}})

  return (
    <div>
      <h1>{product.name}</h1>
    </div>
  )
}
```

We plan to use `react-query` under the hood, so you'll get all the features it provides such as caching, polling, revalidate on window focus, etc.

#### Static Pages

For public pages without private user data, you can use Blitz queries at build time for a fully static page.

```tsx
// pages/products/[id].tsx
import {PromiseReturnType} from 'blitz/types'
import getProduct from '/some/path/getProduct'

export const getStaticProps = async context => {
  const product = await getProduct({where: {id: context.params?.id}})

  if (!product) throw new Error('Missing product!')

  return {props: {product}}
}

export default function(props: PromiseReturnType<typeof getStaticProps>['props']) {
  return (
    <div>
      <h1>{props.product.name}</h1>
    </div>
  )
}
```

### B. Mutations

Mutations follow the same pattern. Export a plain Javascript function with your function input as the first argument and the framework supplied context as the second.

```ts
// /some/path/updateProduct.ts
import {Context} from 'blitz/types'
import db, {ProductUpdateInput} from 'db'

export default async function updateProduct(data: ProductUpdateInput, ctx?: Context) {
  // Can do any pre-processing here or trigger events

  const product = await db.setUser(ctx.session.user).product.update({where: {id: data.id}, data})

  // Can do any post-processing here or trigger events

  return product
}
```

Then in your component, import the above mutation function and call it directly.

```tsx
// pages/product/[id]/edit.tsx
import {useQuery, Router} from 'blitz'
import getProduct from '/some/path/getProduct'
import updateProduct from '/some/path/updateProduct'
import {Formik} from 'formik'

export default function(props: {query: {id: number}}) {
  const [product] = useQuery(getProduct, {where: {id: props.query.id}})

  return (
    <div>
      <h1>{product.name}</h1>
      <Formik
        initialValues={product}
        validate={/* TBD */}
        onSubmit={async values => {
          try {
            const product = await updateProduct(values)
            Router.push(`/products/${product.id}`)
          } catch (error) {
            alert('Error saving product')
          }
        }}>
        {({handleSubmit}) => <form onSubmit={handleSubmit}></form>}
      </Formik>
    </div>
  )
}
```

### C. How the Heck Does That Work?

Blitz does some fancy stuff at compile time to convert the imported queries and mutations in your component into remote procedure calls (RPC). So your server code stays on the server and isn't actually included in your client-side bundle.

We love this approach for all the following reasons:

1. Extremely simple. Just import the function and call it like any other function.
2. Everything has complete Typescript types without a compiler (unlike GraphQL).
3. The entire network layer is abstracted away so you can focus on what makes your app unique.
4. Queries and mutations are highly composable and easily testable.

### D. Composition

Queries and mutations are highly composable because they are plain Javascript functions.

Here's an example:

```ts
// /some/path/importProducts.ts
import {Context} from 'blitz/types'
import {createProduct} from '.'
import {ProductCreateInput} from 'db'

export default async function(data: ProductCreateInput[], ctx?: Context) {
  let numberOfCreatedProducts = 0
  let errors: any[] = []

  for (let product of data) {
    try {
      await createProduct(data, ctx)
      numberOfCreatedProducts++
    } catch (error) {
      errors.push({name: product.name, error})
    }
  }

  if (errors) throw new Error(errors)

  return numberOfCreatedProducts
}
```

### E. Auto Generated HTTP API

All queries and mutations will be automatically exposed at a unique URL, such as `/api/product/queries/getProduct` and `/api/product/mutations/updateProduct`.

### F. Middleware

Queries and mutations are HTTP agnostic, but you still need a way to access raw HTTP for advanced use cases. For this, Blitz provides a middleware API that can add arbitrary data to the context object that's provided to the query/mutation function.

This example gets the `referer` and adds it to the context object.

```ts
// /some/path/special.ts
import {Context, ApiRequest, ApiResponse} from 'blitz/types'

type ReferrerContext = {referrer: string}

export const middleware = [
  (req: NextApiRequest, res: NextApiResponse): ReferrerContext => {
    return {
      referrer: req.headers.referer,
    }
  },
]

type SpecialContext = Context & ReferrerContext

export default async function special(data: any, ctx?: SpecialContext) {
  return ctx?.referrer
}
```

## 5. File Structure and Routing

[Blitz file structure and routing are detailed in a separate RFC](https://github.com/blitz-js/drafts/pull/3). We'd love your feedback on that too!

## 6. Authentication

We are working on an authentication system that's highly secure and deeply integrated with Blitz. We will use Passport.js so you can use any of its strategies for identity verification. Then we are building an advanced solution for session management that has many features such as session timeout, session revocation, and anonymous session data that can be transferred to an authenticated session. Also it will automatically prevent against CSRF, XSS, and database session theft.

Blitz will automatically provide the authenticated session data to queries and mutations via the context argument.

We will later post a separate RFC with all the details on this.

## 7. Why not MVC?

The Model-View-Controller (MVC) pattern was designed for building graphical user interfaces where each UI component has its own model, view, and controller, _not as an overall application architecture_.

MVC has many problems when used as an app architecture such as too much boilerplate, too much indirection, controllers are not composable, confusion on where specific code should live, etc.

In MVC apps, Controllers are mainly responsible for taking an HTTP request and connecting it to the appropriate code for handling the request. We've totally eliminated the need for controllers because, with the RPC pattern, you are simply executing functions.

## 8. Why not GraphQL?

GraphQL is a great technology, but it's not great as the backbone for apps that are monolithic, fullstack, and serverless.

Primarily because GraphQL is not scalable when deployed to serverless platforms like Zeit or Netlify. It's not scalable because all of your resolver code is stuffed into a single Lambda causing you to quickly run into cold start issues and max code size issues.

Anyone deploying a sizable GraphQL API via serverless Lambda functions does so by splitting the graph into many small Lamba functions, each of which is responsible for discrete set of types. Then you have a separate gateway like Apollo Federation or GraphQL Mesh to stitch the entire schema back together again.

Other reasons include:

1. A lot of boilerplate, especially for use with Typescript
2. Typescript types require a code watcher and compiler
3. Extra code dependencies

## 9. Blitz is GraphQL Ready

Although Blitz doesn't use GraphQL, all your Blitz queries and mutations can easily be used as GraphQL resolvers.

## 10. SSR?

The initial Blitz announcement relied heavily on SSR. With the architecture in this RFC, SSR is no longer required (but SSR is still supported!).

You have two choices for the initial visit to an authenticated page: (1) SSR or (2) Static page shell with dynamic data populated on the client. Once the first page is loaded in the browser, all subsequent pages are rendered client side, regardless of how the first visit was rendered.

### Approach 1: SSR

The first thing the user sees will be a fully populated page, because you only need one round trip to the server to get everything on that page. The user will have to wait a bit longer to see anything than with the static shell, but the benefit is they don't see a loading screen.

### Approach 2: Static Page Shell

The first thing the user sees will be an empty app shell with a loading screen. This static shell renders extremely fast because it's cached on a CDN, but then the user has to wait for the dynamic data to be retrieved from the server.

Later we'll provide more in-depth documentation on the tradeoffs between these two approaches.

You will be able to choose between SSR and static shell on a page-by-page basis. The exact API for making this choice is still TBD, but likely you will choose between `useQuery` and `useSSRQuery`.

## 11. Deployment Agnostic

Like Next.js, Blitz is agnostic as to your deployment type and host. Blitz apps are compiled to Next.js, so you can deploy a Blitz app in all the same ways you can deploy Next.js.

Blitz/Next are not tied to the Zeit platform. The build produces plain Javascript files you can run anywhere, including directly on AWS Lambda.

Also, Blitz/Next can be self-hosted on a traditional server, like a standard Express app, for example.

## 12. Background Processing

Asynchronous background processing is a very important for anything beyond trivial apps. If you host a Blitz app on a traditional server, you can do normal Node.js background processing with a library like Bull. But for serverless deployments, you need to use a third-party service like CloudAMQP.com.

We will be exploring ways to make this super easy for serverless environments.

## 13. Websockets?

Blitz currently has no plan for integrated websocket support because they aren't well supported in serverless environments and aren't currently supported by Prisma 2.

The reccomended approach for live updates is to use polling. Polling is a first-class Blitz feature.

Alternatively, you can use a third-party service like Pusher.com for high performance websockets.

## 14. Summary

Once we have sufficient feedback on this proposal and made any necessary changes, we'll dive headlong into development to bring this entire vision to life!

### How You Can Help

1. **Contributions of any kind, including code, design, documentation, and translation.**
   1. [Join the Blitz Slack group](https://slack.blitzjs.com)
   2. Find an unclaimed issue that is marked as ready to work on. Then comment that you are working on it. **NOTE:** There's currently very few issues, but we'll soon be creating a lot of new issues for building everything defined in this RFC. You can watch Slack for new issues and/or watch this repo.
2. **Donation or Sponsorship**
   1. Click the sponsor button at the top of this repo to see the options.
