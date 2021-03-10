# With Docker

This example shows how to set custom environment variables for your **docker application** at runtime.

The `dockerfile` is the simplest way to run Next.js app in docker, and the size of output image is `173MB`. However, for an even smaller build, you can do multi-stage builds with `dockerfile.multistage`. The size of output image is `85MB`.

You can check the [Example Dockerfile for your own Node.js project](https://github.com/mhart/alpine-node/tree/43ca9e4bc97af3b1f124d27a2cee002d5f7d1b32#example-dockerfile-for-your-own-nodejs-project) section in [mhart/alpine-node](https://github.com/mhart/alpine-node) for more details.

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example with-docker with-docker-app
# or
yarn create next-app --example with-docker with-docker-app
```

Build it with docker:

```bash
# build
docker build -t next-app .
# or, use multi-stage builds to build a smaller docker image
docker build --target production -t next-app -f ./Dockerfile.multistage .
```

Alternatively you can add these commands as scripts to your package.json and simply run

`yarn build-docker`
or
`yarn build-docker-multistage`

Run the docker image:

```bash
docker run --rm -it \
  -p 3000:3000 \
  next-app
```

or use `yarn build-docker-multistage`
