# Improper webpack `devtool` used in development mode

#### Why This Error Occurred

Next.js chooses the most optimal `devtool` for use with webpack. Changing the `devtool` in development mode will cause severe performance regressions with your application.

#### Possible Ways to Fix It

Please remove the custom `devtool` override or only apply it to production builds in your `next.config.js`.

```js
module.exports = {
  webpack: (config, options) => {
    if (!options.dev) {
      config.devtool = options.isServer ? false : 'your-custom-devtool'
    }
    return config
  },
}
```
