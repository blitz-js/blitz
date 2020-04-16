# Blitz Alpha User Guide

<br>

Before getting started, you should know **this is alpha software**. Blitz is incomplete. There are rough spots and bugs. APIs may change. But you can start building things with it! 

If you have any issues at all, please join the [Blitz slack](https://slack.blitzjs.com) and tell us in the **#help** channel. If you get stuck and frustrated, please don't blame yourself. This user guide, and Blitz in general, is not yet fine-tuned for those with less experience. Eventually it will be because this is very important to us.

<br>

## Introduction

Blitz is a Rails-like framework for building monolithic, fullstack React apps. The idea is that Blitz makes you extremely productive by doing as much set up and grunt work for you.

**When building a Blitz app, you don’t have to think about “building an API” or “fetching data from your API”**. You only think about writing functions that get and change data. And to use those functions in your component, you simply import and call them like a regular function.

Blitz is built on Next.js, so if you are familiar with that, you will feel right at home.

<br>

## Blitz App Development

### Set Up Your Computer

- [ ] You need Node.js 12 or newer
- [ ] You need Postgres installed and running.
  - On macOS, you can use `brew install postgres` or install [Postgres.app](https://postgresapp.com/)
  
<br>

### Create Your Blitz App

1. `npm install -g blitz` or `yarn global install blitz`
2. Run `blitz new myAppName` to create a new blitz app in the `myAppName` directory
3. `cd myAppName`
4. `blitz start`
5. View your baby app at [https://localhost:3000](https://localhost:3000)

<br>

### Set Up Your Database

By default, Blitz uses Prisma 2 which is a strongly typed database client. You probably want to read [the Prisma 2 documentation](https://www.prisma.io/docs/understand-prisma/introduction). _Note, Prisma 2 is not required for Blitz. The only Prisma-Blitz integration is the `blitz db` cli command. You can use anything you want, such as Mongo, TypeORM, etc._

1. Open `db/prisma.schema` and add the following:

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
  projectId   Id
}
```

2. Run `blitz db migrate`
   - If this fails, you need to change the `DATABASE_URL` value in `.env` to whatever is required by your Postgres installation.

<br>
   
### Generate the CRUD Files

_CRUD = create, read, update, delete_

1. Run `blitz generate crud project`
2. Run `blitz generate crud task --parent project`
3. Open [https://localhost:3000/projects](https://localhost:3000/projects) to see the default project list page

<br>

### Pages

Blitz.js pages are exactly the same as Next.js pages. If you need, read [the Next.js Page documentation](https://nextjs.org/docs/basic-features/pages)


- Unlike Next.js, you can have many `pages/` folders nested inside `app/`. This way pages can be organized neatly, especially for larger projects. Like this: 
  - `app/pages/about.tsx`
  - `app/projects/pages/projects/index.tsx`
  - `app/tasks/pages/projects/[projectId]/tasks/[id].tsx`
- All React components inside a `pages/` folder are accessible at a URL corrosponding to it's path inside `pages/`. So `pages/about.tsx` will be at `localhost:3000/about`.  

<br>

### Writing Queries & Mutations

Blitz queries and mutations are plain, asynchronous Javascript functions that always run on the server.

We automatically alias the root of your project, so `import db from 'db'` is importing `<project_root>/db/index.ts`

**Example Query:**

```ts
// app/products/queries/getProduct.tsx
import db, {FindOneProductArgs} from 'db'

export default async function getProduct(args: FindOneProductArgs) {

  // Can do any pre-processing or event triggers here
  const product = await db.product.findOne(args)
  // Can do any post-processing or event triggers here

  return product
}
```

**Example Mutation:**

```ts
// app/products/mutations/createProduct.tsx
import db, {ProductCreateArgs} from 'db'

export default async function createProduct(args: ProductCreateArgs) {
  
  // Can do any pre-processing or event triggers here
  const product = await db.product.create(args)
  // Can do any post-processing or event triggers here
  
  return product
}
```

<br>

### Using Queries


#### In a React Component

Blitz provides a `useQuery` hook, which is built on [`react-query`](https://github.com/tannerlinsley/react-query). The first argument is a query function. The second argument is the input to the query function. The third argument is any valid react-query configuration item.

At build time, the direct function import is swapped out for a function that executes a network call to run the query serverside.

```tsx
import {useQuery} from 'blitz'
import getProduct from '/app/products/queries/getProduct'

export default function(props: {query: {id: number}}) {
  const [product] = useQuery(getProduct, {where: {id: props.query.id}})
  
  return <div>{product.name}</div>
}
```

#### On the Server

In `getStaticProps`, a query function can be called directly without `useQuery`

```tsx
import getProduct from '/app/products/queries/getProduct'

export const getStaticProps = async context => {
  const product = await getProduct({where: {id: context.params?.id}})
  return {props: {product}}
}

export default function({product}) {
  return <div>{product.name}</div>
}
```

In `getServerSideProps`, TODO


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
- All React components inside an `api/` folder are accessible at a URL corrosponding to it's path inside `api/`. So `app/projects/api/webhook.tsx` will be at `localhost:3000/api/webhook`.

<br>

### Deploy to Production

1. You need a production Postgres database. It's easy to set this up on [Digital Ocean](https://www.digitalocean.com/products/managed-databases-postgresql/?refcode=466ad3d3063d).
2. For deploying serverless, you also need a connection pool. This is also relatively easy to set up on Digital Ocean.
   1. [Read the Digitial Ocean docs on setting up your connection pool](https://www.digitalocean.com/docs/databases/postgresql/how-to/manage-connection-pools/#creating-a-connection-pool?refcode=466ad3d3063d)
   2. Ensure you set your "Pool Mode" to be "Session" instead of "Transaction" (because of a bug in Prisma)
3. Lastly, you need your entire database connection string. If you need, [read the Prisma docs on this](https://www.prisma.io/docs/reference/database-connectors/postgresql#connection-details).
   1. If deploying to serverless with a connection pool, make sure you get the connection string to your connection pool, not directly to the DB.

#### Serverless

Assuming you already have a Zeit account and the `now` cli installed, you can do the following:

1. Add your DB url as a secret environment variable by running `now secrets add @database-url "DATABASE_CONNECTION_STRING"`
2. Add a `now.json` at your project root with
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
3. Run `now`

Once working and deployed to production, your app should be very stable because it’s running Next.js which is already battle tested. 

#### Traditional, Long-Running Server

You can deploy a Blitz app like a regular Node or Express project.

`blitz start --production` will start your app in production mode. Make sure you provide the `DATABASE_URL` environment variable for your production database.

<br>

## More Information

- Read the [Architecture RFC](https://github.com/blitz-js/blitz/pull/73) for more details on the architecture, our decision making, and how queries/mutations work under the hood
- Read the [File Structure & Routing RFC](https://github.com/blitz-js/blitz/pull/74) for more details about the file structure and routing conventions.

<br>

## What's Next for Blitz.js?

Here's the list of big things that are currently missing from Blitz but are top priority for us:

- A real Blitzjs.com website and documentation
- Authentication 
- Authorization (use auth rules both on server and client)
- Model validation (use model validation both on server and client)
- `blitz new` including set up for testing, Prettier, ESLint, styling system (Tailwind, CSS-in-JS, etc)
- ... and tons more 🙂

<br>

## How You Can Help

1. Tell others about Blitz! 
2. Report bugs by opening an issue here on GitHub
3. Send us feedback in the [Blitz slack](https://slack.blitzjs.com).
4. Contribute code. We have a lot of issues that are ready to work on! Start by reading [The Contributing Guide](https://github.com/blitz-js/blitz/blob/canary/CONTRIBUTING.md). Let us know if you need help.
5. Any way you want! We totally appreciate any type of contribution, such as documentation, videos, blog posts, etc.

<br>

That's all for now. We hope to see you in the [Blitz slack community](https://slack.blitzjs.com)!
