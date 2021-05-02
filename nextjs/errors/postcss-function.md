# PostCSS Configuration Is a Function

#### Why This Error Occurred

The project's custom PostCSS configuration exports a function instead of an object.

#### Possible Ways to Fix It

Adjust the custom PostCSS configuration to not export a function.
Instead, return a plain object—if you need environment information, read it from `process.env`.

**Before**

```js
module.exports = ({ env }) => ({
  plugins: {
    'postcss-plugin': env === 'production' ? {} : false,
  },
})
```

**After**

```js
module.exports = {
  plugins: {
    'postcss-plugin': process.env.NODE_ENV === 'production' ? {} : false,
  },
}
```
