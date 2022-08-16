# Contributing

[Read the Contributing Guide at Blitzjs.com](https://blitzjs.com/docs/contributing)

## To run tests

Make sure you have `chromedriver` installed for your Chrome version. You can install it with

- `brew install --cask chromedriver` on Mac OS X
- `chocolatey install chromedriver` on Windows
- Or manually download the version that matches your installed chrome version (if there's no match, download a version under it, but not above) from the [chromedriver repo](https://chromedriver.storage.googleapis.com/index.html) and add the binary to `<next-repo>/node_modules/.bin`

You may also have to [install Rust](https://www.rust-lang.org/tools/install) and build our native packages to see all tests pass locally. We check in binaries for the most common targets and those required for CI so that most people don't have to, but if you do not see a binary for your target in `packages/next/native`, you can build it by running `yarn --cwd packages/next build-native`. If you are working on the Rust code and you need to build the binaries for ci, you can manually trigger [the workflow](https://github.com/vercel/next.js/actions/workflows/build_native.yml) to build and commit with the "Run workflow" button.

Running all tests:

```sh
pnpm test
```
