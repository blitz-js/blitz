# getStaticProps/getServerSideProps can not be attached to the page component

#### Why This Error Occurred

On one of your page's components you attached either `getStaticProps`, `getStaticPaths`, or `getServerSideProps` as a member instead of as a separate export.

These methods can not be attached in the same way as `getInitialProps` and must be their own export

#### Possible Ways to Fix It

Move the method to it's own export from your page.

**Before**

```jsx
function Page(props) {
  return <p>hello world</p>
}

Page.getStaticProps = () => ({
  props: {
    hello: 'world',
  },
})

export default Page
```

**After**

```jsx
function Page(props) {
  return <p>hello world</p>
}

export default Page

export const getStaticProps = () => ({
  props: {
    hello: 'world',
  },
})
```

### Useful Links

- [Data Fetching Docs](https://nextjs.org/docs/basic-features/data-fetching)
