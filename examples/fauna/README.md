# Blitz Fauna Example

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
