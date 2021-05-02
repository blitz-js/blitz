# `<title>` should not be used in \_document.js's `<Head>`

#### Why This Error Occurred

Adding `<title>` in `pages/_document.js` will lead to unexpected results with `next/head` since `_document.js` is only rendered on the initial pre-render.

#### Possible Ways to Fix It

Set `<title>` in `pages/_app.js` instead:

```js
// pages/_app.js
import React from 'react'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>My new cool app</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
```

### Useful Links

- [The issue this was reported in: #4596](https://github.com/vercel/next.js/issues/4596)
