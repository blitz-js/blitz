# custom-server

## Development

1. Install
   ```sh
   yarn
   ```
2. Migrate
   ```sh
   blitz prisma migrate deploy --preview-feature
   ```
3. Start the dev server

```sh
blitz start

// Or if you want hot-reloading of server.js, use:
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production

```sh
blitz build
blitz start --production
```
