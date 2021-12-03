# Contributing

[Read the Contributing Guide at Blitzjs.com](https://blitzjs.com/docs/contributing)

## Notes For Core Team

### To Publish a new NPM Package under `@blitzjs/` namespace

1. cd into the package directory
2. Run `npm publish --tag danger --access public`
   - `--access public` is required because scoped packages are set to private by default

### Syncing Next.js Fork

1. Run `yarn push-nextjs`
   - If it fails with an error of `git-subrepo: Can't commit: 'subrepo/nextjs' doesn't contain upstream HEAD:`, then run `yarn push-nextjs --force` (see https://github.com/ingydotnet/git-subrepo/issues/530)
2. Create new git branch for the upgrade
3. In the forked repo (https://github.com/blitz-js/next.js), run:
   1. `git pull`
   2. `git fetch --all`
   3. `git merge v10.2.0` (change the version to be the version you are updating to)
   4. Run `rm -rf examples && git add examples`
   5. To resolve conflict with their version for a path, like docs, run this:
      - `git checkout --theirs docs && git add docs`
   6. Resolve all merge conflicts and complete merge
   7. Run `yarn` and make sure all builds complete
   8. Run `yarn lint` and fix any issues
   9. Commit all changes to finish merge
   10. `git push`
4. Run `yarn pull-nextjs`
5. Run `yarn`
6. Run `yarn manypkg check` and optionally `yarn manypkg fix` to fix any issues
7. Under `nextjs/`, run `./scripts/check-pre-compiled.sh` and commit the changes
8. Run `yarn build:nextjs`
9. Run `yarn lint` - fix any issues
10. Run `yarn build` - fix any issues
11. Run `yarn test:nextjs-size` and update tests if there are any failures
12. Open PR and fix any failing tests
13. Update any references to nextjs in new code including imports like `next/image`, etc.
14. Any doc updates needed?
15. Merge PR
16. `yarn push-nextjs`

#### Troubleshooting

##### yarn lint - Failed to load parser

Caused by invalid version of `@babel/eslint-parser`. `7.13.14` is a working version. I think it may be an incompatibility between this version and the version of eslint?

- change version of eslint-parser
- run `yarn --check-files`
- run `./scripts/check-pre-compiled.sh` from `./nextjs/`
- run `yarn build:nextjs` from root
- Try linting again

```
~/c/blitz> yarn lint
yarn run v1.22.10
$ eslint --ext ".js,.ts,.tsx" .

Oops! Something went wrong! :(

ESLint: 7.21.0

Error: Failed to load parser './parser.js' declared in 'examples/auth/.eslintrc.js » eslint-config-blitz » eslint-config-next': Cannot find module '@babel/parser'
    at webpackEmptyContext (/Users/b/c/blitz/nextjs/packages/next/dist/compiled/babel/bundle.js:1:33258)
    at Object.73139 (/Users/b/c/blitz/nextjs/packages/next/dist/compiled/babel/bundle.js:2194:783181)
    at __nccwpck_require__ (/Users/b/c/blitz/nextjs/packages/next/dist/compiled/babel/bundle.js:2194:1065271)
    at Object.eslintParser (/Users/b/c/blitz/nextjs/packages/next/dist/compiled/babel/bundle.js:1:43676)
    at Object.<anonymous> (/Users/b/c/blitz/nextjs/packages/next/dist/compiled/babel/eslint-parser.js:1:100)
    at Module._compile (/Users/b/c/blitz/node_modules/v8-compile-cache/v8-compile-cache.js:192:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1027:10)
    at Module.load (internal/modules/cjs/loader.js:863:32)
    at Function.Module._load (internal/modules/cjs/loader.js:708:14)
    at Module.require (internal/modules/cjs/loader.js:887:19)
error Command failed with exit code 2.
```

##### Failed to compile - LICENSE

This error occurs sometimes when you import code from packages/next/build/utils.ts into some other code like config-shared.ts. Solution is to move the code into another file.

```
Failed to compile.
../../../packages/next/dist/compiled/webpack/LICENSE
Module parse failed: Unexpected token (1:10)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See webpack.js.org/concepts#loaders
> Copyright JS Foundation and other contributors
|
| Permission is hereby granted, free of charge, to any person obtaining
```
