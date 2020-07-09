
[![Blitz.js](https://raw.githubusercontent.com/blitz-js/art/master/github-cover-photo.png)](https://blitzjs.com)

This project was bootstraped by the [Blitz.js](https://github.com/blitz-js/blitz).

# __name__

## Getting Started

Run your app in the development mode.

```
blitz start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Commands

Blitz comes with a powerful CLI that is meant to help you on all sort of tasks, guiding you towards our best practices.

```
  blitz [COMMAND]

  build     Create a production build
  console   Run the Blitz console REPL
  db        Run database commands
  generate  Generate new files for your Blitz project
  help      display help for blitz
  new       Create a new Blitz project
  start     Start a development server
  test      Run project tests
```

## What's included?

Here is the structure of your app.

```
mysite
├── app
│   ├── components
│   │   └── ErrorBoundary.tsx
│   ├── layouts
│   └── pages
│       ├── _app.tsx
│       ├── _document.tsx
│       └── index.tsx
├── db
│   ├── migrations
│   ├── index.ts
│   └── schema.prisma
├── integrations
├── node_modules
├── public
│   ├── favicon.ico
│   └── logo.png
├── utils
├── .babelrc.js
├── .env
├── .eslintrc.js
├── .gitignore
├── .npmrc
├── .prettierignore
├── README.md
├── blitz.config.js
├── package.json
├── tsconfig.json
└── yarn.lock
```

These files are:

- The `app/` directory is a container for most of your project. This is where you’ll put any pages or API routes.

- `db`/ is where your database configuration goes. If you’re writing models or checking migrations, this is where to go.

- `node_modules/` is where your “dependencies” are stored. This directory is updated by your package manager, so you don’t have to worry too much about it.

- `public/` is a directory where you will put any static assets. If you have images, files, or videos which you want to use in your app, this is where to put them.

- `utils/` is a good place to put any shared utility files which you might use across different sections of your app.

- `.babelrc.js`, `.env`, etc. ("dotfiles") are configuration files for various bits of JavaScript tooling.

- `blitz.config.js` is for advanced custom configuration of Blitz. It extends [`next.config.js`](https://nextjs.org/docs/api-reference/next.config.js/introduction).

- `package.json` contains information about your dependencies and devDependencies. If you’re using a tool like `npm` or `yarn`, you won’t have to worry about this much.

- `tsconfig.json` is our recommended setup for TypeScript.


You can read more about it in the [File Structure](https://blitzjs.com/docs/file-structure) section of our documentation.


You can read more about it on the [CLI Overview](https://blitzjs.com/docs/cli-overview) documentation.

## Learn more

You can learn more about Blitz on the [Documentation](https://blitzjs.com/docs/getting-started) website.

### The Blitz.js Manifesto
Read our [Manifesto](https://blitzjs.com/docs/manifesto) to understand more about what Blitz is for.

### Next.js
Next.js is baked into Blitz and almost all features of [Next.js](https://nextjs.org/) are supported. For more info on the differences see here: [Why use Blitz instead of Next.js](https://blitzjs.com/docs/why-blitz)


## Get in touch

The Blitz community is warm, safe, diverse, inclusive, and fun! Feel free to reach out to us in any of our communication channels.

* [Website](https://blitzjs.com/)
* [Slack](https://slack.blitzjs.com/)
* [Report an issue](https://github.com/blitz-js/blitz/issues/new/choose)
* [GitHub discussions](https://github.com/blitz-js/blitz/discussions)
* [Sponsors and donations](https://github.com/blitz-js/blitz#sponsors-and-donations)
* [Contributiong Guide](https://blitzjs.com/docs/contributing)

Join our [Slack Community](https://slack.blitzjs.com/) where we help each other build Blitz apps. It's also where we collaborate on building Blitz itself.

For questions and longer form discussions, post in our [forum](https://github.com/blitz-js/blitz/discussions).
