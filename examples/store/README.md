## Getting Started

1. Ensure you have Postgres installed locally
2. Set the `DATABASE_URL` environment variable, something like this:

```
DATABASE_URL=postgresql://<your_computer_username>@localhost:5432/blitz-example-store
```

3. DB migrate

```
yarn blitz db migrate
```

4. Start the dev server

```
yarn blitz start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
