# Blitz Alpha User Guide

<br>

Before getting started, you should know **this is alpha software**. Blitz is incomplete. There are rough spots and bugs. APIs may change. But you can start building things with it! 

If you have any issues at all, please join the [Blitz slack](https://slack.blitzjs.com) and tell us in the **#help** channel. If you get stuck and frustrated, please don't blame yourself. This user guide, and Blitz in general, is not yet fine-tuned for those with less experience. Eventually it will be because this is very important to u

<br>

## Introduction

Blitz is a Rails-like framework for building monolithic, fullstack React apps. The idea is that Blitz makes you extremely productive by doing as much set up and grunt work for you.

**When building a Blitz app, you don’t have to think about “building an API” or “fetching data from your API”**. You only think about writing functions that get and change data. And to use those functions in your component, you simply import and call them like a regular function.

Blitz is built on Next.js, so if you are familiar with that, you will feel right at home.

### Core Differences Between Blitz.js and Next.js

- Next.js requires one pages folder, but in Blitz you can have multiple pages folders anywhere inside `app/`. All your pages are merged together at build time.
- For custom API routes, Next.js uses `pages/api/` but Blitz uses a top level `api/` folder.

<br>

## Blitz App Development

### Setting Up Your Computer

- [ ] You need Node.js 12 or newer
- [ ] You need Postgres installed and running.
  - On macOS, you can use `brew install postgres` or install [Postgres.app](https://postgresapp.com/)
  

### Create Your Blitz App

1. `npm install -g blitz` or `yarn global install blitz`
2. Run `blitz new myAppName` to create a new blitz app in the `myAppName` directory
3. `cd myAppName`
4. `blitz start`
5. View your app at [https://localhost:3000](https://localhost:3000)


### Set Up Your Database

By default, Blitz uses Prisma 2 which is a strongly typed database client (not an ORM). You probably want to read [the Prisma 2 documentation](https://www.prisma.io/docs/understand-prisma/introduction). _Note, Prisma 2 is not required for Blitz. You can use anything you want, such as TypeORM._

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
   
   
### Generate the CRUD Files

_CRUD = create, read, update, delete_

1. Run `blitz generate crud project`
2. Run `blitz generate crud project task`
3. Open [https://localhost:3000/projects](https://localhost:3000/projects) to see the default project list page

### Pages

Blitz.js pages are exactly the same as Next.js pages. If you need, read [the Next.js Page documentation](https://nextjs.org/docs/basic-features/pages)


- Unlike Next.js, you can have have many `pages/` folders nested inside `app/`. This way pages can be organized neatly, especially for larger projects. Like this: 
  - `app/pages/about.tsx`
  - `app/projects/pages/projects/index.tsx`
  - `app/tasks/pages/projects/[projectId]/tasks/[id].tsx`
- All React components inside a `pages/` folder are accessible at a URL corrosponding to it's path inside `pages/`. So `pages/about.tsx` will be at `localhost:3000/about`.  



### Intro to Queries & Mutations

Blitz queries and mutations are plain, asynchronous Javascript functions that always run on the server.

Blitz automatically aliases the root of your project, so `import db from 'db'` is importing `<project_root>/db/index.ts`

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

### Mutations



### Custom API Routes

Blitz.js custom API routes are exactly the same as Next.js custom API routes. If you need, read [the Next.js API route documentation](https://nextjs.org/docs/api-routes/introduction)

- Unlike Next.js, your `api/` folder must be a sibling of `pages/` instead of being nested inside.
- All React components inside an `api/` folder are accessible at a URL corrosponding to it's path inside `api/`. So `app/projects/api/webhook.tsx` will be at `localhost:3000/api/webhook`.


### Deploy to Production

Once working and deployed to production, your app should be very stable because it’s running Next.js which is already battle tested. 

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
2. Contribute code! Get started by reading [The Contributing Guide](https://github.com/blitz-js/blitz/blob/canary/CONTRIBUTING.md)
