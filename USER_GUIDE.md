![Blitz Alpha User Guide](https://raw.githubusercontent.com/blitz-js/art/master/alpha-user-guide.png)

<br>

Before getting started, you should know **this is alpha software**. Blitz is incomplete. There are rough spots and bugs. APIs may change. But you can build an app and deploy it to production. We're excited to see what you build!

If you have any issues at all, please [open an issue](https://github.com/blitz-js/blitz/issues/new/choose) or join the [Blitz slack](https://slack.blitzjs.com) and talk to us in the **#help** channel. If you get stuck and frustrated, please don't blame yourself. This user guide, and Blitz in general, is not yet fine-tuned for those with less experience. But eventually, it will be because this is very important to us.

If you’re looking for a slower, more guided start to Blitz, read the **[Blitz Beginner Tutorial](https://github.com/blitz-js/blitz/blob/canary/TUTORIAL.md)**.

<br>

## Introduction

Blitz is a Rails-like framework for building monolithic, full-stack React apps. The idea is that Blitz makes you extremely productive by doing as much set up and grunt work for you.

**When building a Blitz app, you don’t have to think about “building an API” or “fetching data from your API”**. You only think about writing functions that get and change data. And to use those functions in your component, you simply import and call them like a regular function.

Blitz is built on Next.js, so if you are familiar with that, you will feel right at home.

<br>

## Blitz App Development

### Set Up Your Computer

- [ ] You need Node.js 12 or newer

<br>

### Create Your Blitz App

1. `npm install -g blitz` or `yarn global add blitz`
2. Run `blitz new myAppName` to create a new blitz app in the `myAppName` directory
3. `cd myAppName`
4. `blitz start`
5. View your baby app at [http://localhost:3000](http://localhost:3000)

<br>

### Set Up Your Database

By default, Blitz uses Prisma 2 which is a strongly typed database client. **You probably want to read [the Prisma 2 documentation](https://www.prisma.io/docs/understand-prisma/introduction).** _Note, Prisma 2 is not required for Blitz. The only Prisma-Blitz integration is the `blitz db` cli command. You can use anything you want, such as Mongo, TypeORM, etc._

1. Open `db/schema.prisma` and add the following:

```prisma
model Project {
  id        Int      @default(autoincrement()) @id
  name      String
  tasks     Task[]
}

model Task {
  id          Int      @default(autoincrement()) @id
  name        String
  project     Project  @relation(fields: [projectId], references: [id])
  projectId   Int
}
```

2. Run `blitz db migrate`

<br>

### Scaffold out all the files your basic CRUD actions

_CRUD = create, read, update, delete_

1. Run `blitz generate all project` to generate fully working queries, mutations, and pages
2. Open [http://localhost:3000/projects](http://localhost:3000/projects) to see the default project list page
3. Explore the generated pages and view, create, update, and delete projects.
4. Create at least one project
5. Run `blitz generate all task --parent project` to generate fully working queries, mutations, and pages
6. Open [http://localhost:3000/projects/1/tasks](http://localhost:3000/projects/1/tasks) to see the default task list page

<br>

### Pages

Blitz.js pages are exactly the same as Next.js pages. If you need, read [the Next.js Page documentation](https://nextjs.org/docs/basic-features/pages)

- Unlike Next.js, you can have many `pages/` folders nested inside `app/`. This way pages can be organized neatly, especially for larger projects. Like this:
  - `app/pages/about.tsx`
  - `app/projects/pages/projects/index.tsx`
  - `app/tasks/pages/projects/[projectId]/tasks/[taskId].tsx`
- All React components inside a `pages/` folder are accessible at a URL corresponding to its path inside `pages/`. So `pages/about.tsx` will be at `localhost:3000/about`.

The Next.js router APIs are all exported from the `blitz` package: `useRouter()`, `withRouter()`, and `Router`. If you need, read [the Next.js Router documentation](https://nextjs.org/docs/api-reference/next/router).

<br>

### Writing Queries & Mutations

Blitz queries and mutations are plain, asynchronous Javascript functions that always run on the server.

We automatically alias the root of your project, so `import db from 'db'` is importing `<project_root>/db/index.ts`

**Example Query:**

```ts
// app/products/queries/getProduct.tsx
import db, {FindOneProjectArgs} from 'db'

type GetProjectInput = {
  where: FindOneProjectArgs['where']
  include?: FindOneProjectArgs['include']
}

export default async function getProject({where, include}: GetProjectInput) {
  const project = await db.project.findOne({where, include})

  return project
}
```

**Example Mutation:**

```ts
// app/products/mutations/createProduct.tsx
import db, { ProjectCreateArgs } from "db"

type CreateProjectInput = {
  data: ProjectCreateArgs["data"]
}

export default async function createProject({ data }: CreateProjectInput) {
  const project = await db.project.create({ data })

  return project
}

```

<br>

### Using Queries

#### In a React Component

Blitz provides a `useQuery` hook, which is built on [`react-query`](https://github.com/tannerlinsley/react-query). The first argument is a query function. The second argument is the input to the query function. The third argument is any valid react-query configuration item.

At build time, the direct function import is swapped out for a function that executes a network call to run the query serverside.

**React Concurrent Mode is enabled by default for Blitz apps.** So the `<Suspense>` component is used for loading states and `<ErrorBoundary>` is used to display errors. If you need, you can read the [React Concurrent Mode Docs](https://reactjs.org/docs/concurrent-mode-intro.html).

```tsx
import {Suspense} from 'react'
import {useRouter, useQuery} from 'blitz'
import getProduct from 'app/products/queries/getProduct'
import ErrorBoundary from 'app/components/ErrorBoundary'

function Product() {
  const router = useRouter()
  const productId = parseInt(router.query.productId as string)
  const [product] = useQuery(getProduct, {where: {id: productId}})

  return <div>{product.name}</div>
}

function WrappedProduct() {
  return (
    <div>
      <ErrorBoundary fallback={(error) => <div>Error: {JSON.stringify(error)}</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <Product />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default WrappedProduct
```

#### On the Server

In `getStaticProps`, a query function can be called directly without `useQuery`

```tsx
import getProduct from '/app/products/queries/getProduct'

export const getStaticProps = async (context) => {
  const product = await getProduct({where: {id: context.params?.productId}})
  return {props: {product}}
}

function ProductPage({product}) {
  return <div>{product.name}</div>
}

export default ProductPage
```

In `getServerSideProps`, pass a query function to `ssrQuery` which will ensure appropriate middleware is run before/after your query function.

```tsx
import {ssrQuery} from 'blitz'
import getProduct from '/app/products/queries/getProduct'

export const getServerSideProps = async ({params, req, res}) => {
  const product = await ssrQuery(getProduct, {where: {id: params.productId}}, {req, res}))
  return {props: {product}}
}

function ProductPage ({product}) {
  return <div>{product.name}</div>
}

export default ProductPage
```

For more details, read the comprehensive [Query & Mutation Usage Issue](https://github.com/blitz-js/blitz/issues/89)

<br>

### Using Mutations

Mutations are called directly, like a regular asynchronous function.

At build time, the direct function import is swapped out for a function that executes a network call to run the mutation server-side.

```tsx
import {useQuery} from 'blitz'
import getProduct from '/app/products/queries/getProduct'
import updateProduct from '/app/products/mutations/updateProduct'

function (props) {
  const [product] = useQuery(getProduct, {where: {id: props.id}})

  return (
    <Formik
      initialValues={product}
      onSubmit={async values => {
        try {
          const product = await updateProduct(values)
        } catch (error) {
          alert('Error saving product')
        }
      }}>
      {/* ... */}
    </Formik>
  )
}
```

For more details, read the comprehensive [Query & Mutation Usage Issue](https://github.com/blitz-js/blitz/issues/89)

<br>

### Custom API Routes

Blitz.js custom API routes are exactly the same as Next.js custom API routes. If you need, read [the Next.js API route documentation](https://nextjs.org/docs/api-routes/introduction)

- Unlike Next.js, your `api/` folder must be a sibling of `pages/` instead of being nested inside.
- All files inside an `api/` folder are accessible at a URL corresponding to it's path inside `api/`. So `app/projects/api/webhook.ts` will be at `localhost:3000/api/webhook`.

<br>

### Customize the Webpack Config

Blitz uses the `blitz.config.js` config file at the root of your project. This is exactly the same as `next.config.js`. Read [the Next.js docs on customizing webpack](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config).

<br>

### Deploy to Production

You first need to change the defined datasource in `db/schema.prisma` from SQLite to Postgres

```diff
-datasource sqlite {
-  provider = "sqlite"
- url      = "file:./db.sqlite"
-
+datasource postgresql {
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
+}
```

#### Server

1. Add one of the render.yaml files shown below
2. Push code to your github repo
3. Log in to [Render.com](https://render.com)
4. Click on the "YAML" menu item, then click the "New from YAML" button
5. Connect your github account then select your blitz app repo
6. Click approve
7. Your server + database will be automatically configured and started. Each git push will trigger a new deploy

Without database:

```yaml
// render.yaml
services:
  - type: web
    name: myapp
    env: node
    plan: starter
    buildCommand: yarn
    startCommand: yarn blitz start --production -H 0.0.0.0
```

With postgres database:

```yaml
// render.yaml
services:
  - type: web
    name: myapp
    env: node
    plan: starter
    buildCommand: yarn; blitz db migrate
    startCommand: yarn blitz start --production -H 0.0.0.0
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: myapp-db
          property: connectionString

databases:
  - name: myapp-db
    plan: starter
```

#### Serverless

Assuming you already have a Vercel account and the `now` cli installed, you can do the following:

1. You need a production Postgres database. It's easy to set this up on [Digital Ocean](https://www.digitalocean.com/products/managed-databases-postgresql/?refcode=466ad3d3063d).
2. For deploying serverless, you also need a connection pool. This is also relatively easy to set up on Digital Ocean.
   1. [Read the Digital Ocean docs on setting up your connection pool](https://www.digitalocean.com/docs/databases/postgresql/how-to/manage-connection-pools/#creating-a-connection-pool?refcode=466ad3d3063d)
   2. Ensure you set your "Pool Mode" to be "Session" instead of "Transaction" (because of a bug in Prisma)
3. You need your entire database connection string. If you need, [read the Prisma docs on this](https://www.prisma.io/docs/reference/database-connectors/postgresql#connection-details).
   1. If deploying to serverless with a connection pool, make sure you get the connection string to your connection pool, not directly to the DB.
4. Change your build script in package.json to be `blitz db migrate && blitz build` so that the production DB will be migrated on each deploy
5. Add your DB url as a secret environment variable by running `now secrets add @database-url "DATABASE_CONNECTION_STRING"`
6. Add a `now.json` at your project root with

```json
{
  "env": {
    "DATABASE_URL": "@database-url"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database-url"
    }
  }
}
```

7. Add `next` as a devDependency at the same version that Blitz includes (this is a temporary workaround until Blitz has first class support (very soon!))
8. Run `now`

Once working and deployed to production, your app should be very stable because it’s running Next.js which is already battle-tested.

<br>

## Blitz CLI Commands

#### `blitz new NAME`

Generate a new blitz project at `<current_folder>./NAME`

#### `blitz start`

Start your app in development mode

#### `blitz start --production`

Start your app in production mode

#### `blitz db migrate`

Run any needed migrations via Prisma 2 and generate Prisma Client

#### `blitz db introspect`

Will introspect the database defined in `db/schema.prisma` and automatically generate a complete `schema.prisma` file for you. Lastly, it'll generate Prisma Client.

#### `blitz db studio`

Open the Prisma Studio UI at [http://localhost:5555](http://localhost:5555) so you can easily see and change data in your database.

#### `blitz generate -h`

Scaffold files for a model so you don't have to write them by hand

#### `blitz console`

Start a Node.js REPL that's preloaded with your `db` object and all your queries and mutations. This is awesome for quickly trying your code without running the app!

<br>

## More Information

- Read the [Architecture RFC](https://github.com/blitz-js/blitz/pull/73) for more details on the architecture, our decision making, and how queries/mutations work under the hood
- Read the [File Structure & Routing RFC](https://github.com/blitz-js/blitz/pull/74) for more details about the file structure and routing conventions.
- View an example Blitz app at [`examples/store`](https://github.com/blitz-js/blitz/tree/canary/examples/store)

<br>

## What's Next for Blitz.js?

Here's the list of big things that are currently missing from Blitz but are a top priority for us:

- A real Blitzjs.com website and documentation
- Authentication ([See the Session Management RFC](https://github.com/blitz-js/blitz/pull/475))
- Authorization (use auth rules both on server and client)
- Model validation (use model validation both on server and client)
- Translated documentation. If you're interested in helping, [comment in this issue](https://github.com/blitz-js/blitzjs.com/issues/20).
- React-Native support
- GUI for folks who prefer that over CLIs
- ... and tons more 🙂

<br>

## FAQ

- **Does Blitz support vanilla Javascript?** Yes, but `blitz new` generates all Typescript files right now. We are actively working on this. It mostly works, but we have a few major bugs to fix before it's ready for prime time.
- **Will you support other ESLint configs for the `blitz new` app?** Yes, there's [an issue for this](https://github.com/blitz-js/blitz/issues/161)

<br>

## You are invited to help — let’s build the future of web dev together! 🤝

Blitz is just getting started, and it's going to take an entire community to bring it to fruition!

How you can help:

1. Tell others about Blitz
2. Report bugs by opening an issue here on GitHub
3. Send us feedback in the [Blitz slack](https://slack.blitzjs.com).
4. Contribute code. We have a lot of issues that are ready to work on! Start by reading [The Contributing Guide](https://github.com/blitz-js/blitz/blob/canary/CONTRIBUTING.md). Let us know if you need help.
5. Any way you want! We totally appreciate any type of contribution, such as documentation, videos, blog posts, etc. If you have a crazy idea, feel free to run it past us in Slack! :)
6. [Sponsorships & donations](https://github.com/blitz-js/blitz#sponsors-and-donations)

<br>

That's all for now. We hope to see you in the [Blitz slack community](https://slack.blitzjs.com)!
