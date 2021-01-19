[![npm version](https://badge.fury.io/js/eslint-config-blitz.svg)](https://badge.fury.io/js/eslint-config-blitz)

# eslint-config-blitz

A simple, pleasant set ESLint rules for your project: install a single NPM package, add it to your `.eslintrc`, and you'll be all set.

> This plugin exposes [the ESLint configuration used by Create React App](https://github.com/facebook/create-react-app/tree/master/packages/eslint-config-react-app) without the need of declaring all its dependencies.
> Use it if you need a simple and tested ESLint configuration but you don't want to install a bunch of dependencies.
> It also works in React Native out of the box.

## Setup

1. Install it using npm: `npm install -D eslint eslint-config-blitz`.
2. Extend `blitz` in your `.eslintrc`.

Example `.eslintrc`:

```json
{
  "extends": ["blitz"]
}
```

3. You're done!
