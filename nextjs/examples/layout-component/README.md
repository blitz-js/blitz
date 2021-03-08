# Layout component example

This example shows a very common use case when building websites where you need to repeat some sort of layout for all your pages. Our pages are: `home`, `about` and `contact` and they all share the same `<head>` settings, the `<nav>` and the `<footer>`. Further more, the title (and potentially other head elements) can be sent as a prop to the layout component so that it's customizable in all pages.

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/layout-component&project-name=layout-component&repository-name=layout-component)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example layout-component layout-component-app
# or
yarn create next-app --example layout-component layout-component-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).
