# Blitz Fauna Example

## Intro

This example shows how to use [Fauna](https://dashboard.fauna.com/accounts/register?utm_source=BlitzJS&utm_medium=sponsorship&utm_campaign=BlitzJS_Sponsorship_2020) instead of Prisma and Postgres.

The bulk of the integration is in the following files:

- `blitz.config.js`
- `db/index.ts`

And then also the queries and mutations use Fauna.

By far the main integration work is providing the auth session hooks for reading and writing session data to Fauna. All this is in `blitz.config.js`.

This example use the Fauna GraphQL API since it's more familiar to most people than FQL.

## Getting Started

1. Sign up for a Fauna account
2. Create a new database
3. Click on the GraphQL menu item
4. Upload the graphql schema located at `db/schema.graphql`
5. Click on the Security menu item
6. Create a new auth key, and add the auth key to `.env.local` like this:
```
FAUNA_SECRET=YOUR_AUTH_KEY
```

7. Add the Fauna GraphQL URL to `.env.local`. This URL depends on your [database region](https://docs.fauna.com/fauna/current/api/graphql/endpoints). For instance, for US databases it's `https://graphql.us.fauna.com/graphql`

```
FAUNA_GRAPHQL_URL=YOUR_FAUNA_GRAPHQL_URL
```

8. Start the dev server

```
yarn blitz dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
