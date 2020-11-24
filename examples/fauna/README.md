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
1. Create a new database
1. Click on the GraphQL menu item
1. Upload the graphql schema located at `db/schema.graphql`
1. Click on the Security menu item
1. Create a new auth key, and add the auth key to `.env.local` like this:

```
FAUNA_SECRET=YOUR_AUTH_KEY
```

```
yarn blitz db migrate
```

2. Start the dev server

```
yarn blitz start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
