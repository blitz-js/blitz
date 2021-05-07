---
description: Learn about authentication patterns in Next.js apps and explore a few examples.
---

# Authentication

Authentication verifies who a user is, while authorization controls what a user can access. Next.js supports multiple authentication patterns, each designed for different use cases. This page will go through each case so that you can choose based on your constraints.

## Authentication Patterns

The first step to identifying which authentication pattern you need is understanding the [data-fetching strategy](/docs/basic-features/data-fetching.md) you want. We can then determine which authentication providers support this strategy. There are two main patterns:

- Use [static generation](/docs/basic-features/pages.md#static-generation-recommended) to server-render a loading state, followed by fetching user data client-side.
- Fetch user data [server-side](/docs/basic-features/pages.md#server-side-rendering) to eliminate a flash of unauthenticated content.

### Authenticating Statically Generated Pages

Next.js automatically determines that a page is static if there are no blocking data requirements. This means the absence of [`getServerSideProps`](/docs/basic-features/data-fetching.md#getserversideprops-server-side-rendering) and `getInitialProps` in the page. Instead, your page can render a loading state from the server, followed by fetching the user client-side.

One advantage of this pattern is it allows pages to be served from a global CDN and preloaded using [`next/link`](/docs/api-reference/next/link.md). In practice, this results in a faster TTI ([Time to Interactive](https://web.dev/interactive/)).

Let's look at an example for a profile page. This will initially render a loading skeleton. Once the request for a user has finished, it will show the user's name:

```jsx
// pages/profile.js

import useUser from '../lib/useUser'
import Layout from '../components/Layout'

const Profile = () => {
  // Fetch the user client-side
  const { user } = useUser({ redirectTo: '/login' })

  // Server-render loading state
  if (!user || user.isLoggedIn === false) {
    return <Layout>Loading...</Layout>
  }

  // Once the user request finishes, show the user
  return (
    <Layout>
      <h1>Your Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  )
}

export default Profile
```

You can view this example in action [here](https://next-with-iron-session.vercel.app/). Check out the [`with-iron-session`](https://github.com/vercel/next.js/tree/canary/examples/with-iron-session) example to see how it works.

### Authenticating Server-Rendered Pages

If you export an `async` function called [`getServerSideProps`](/docs/basic-features/data-fetching.md#getserversideprops-server-side-rendering) from a page, Next.js will pre-render this page on each request using the data returned by `getServerSideProps`.

```jsx
export async function getServerSideProps(context) {
  return {
    props: {}, // Will be passed to the page component as props
  }
}
```

Let's transform the profile example to use [server-side rendering](/docs/basic-features/pages#server-side-rendering). If there's a session, return `user` as a prop to the `Profile` component in the page. Notice there is not a loading skeleton in [this example](https://next-with-iron-session.vercel.app/).

```jsx
// pages/profile.js

import withSession from '../lib/session'
import Layout from '../components/Layout'

export const getServerSideProps = withSession(async function ({ req, res }) {
  // Get the user's session based on the request
  const user = req.session.get('user')

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: { user },
  }
})

const Profile = ({ user }) => {
  // Show the user. No loading state is required
  return (
    <Layout>
      <h1>Your Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  )
}

export default Profile
```

An advantage of this pattern is preventing a flash of unauthenticated content before redirecting. It's important to note fetching user data in `getServerSideProps` will block rendering until the request to your authentication provider resolves. To prevent creating a bottleneck and decreasing your TTFB ([Time to First Byte](https://web.dev/time-to-first-byte/)), you should ensure your authentication lookup is fast. Otherwise, consider [static generation](#authenticating-statically-generated-pages).

## Authentication Providers

Now that we've discussed authentication patterns, let's look at specific providers and explore how they're used with Next.js.

### Bring Your Own Database

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/with-iron-session">with-iron-session</a></li>
    <li><a href="https://github.com/nextauthjs/next-auth-example">next-auth-example</a></li>
  </ul>
</details>

If you have an existing database with user data, you'll likely want to utilize an open-source solution that's provider agnostic.

- If you want a low-level, encrypted, and stateless session utility use [`next-iron-session`](https://github.com/vercel/next.js/tree/canary/examples/with-iron-session).
- If you want a full-featured authentication system with built-in providers (Google, Facebook, GitHub…), JWT, JWE, email/password, magic links and more… use [`next-auth`](https://github.com/nextauthjs/next-auth-example).

Both of these libraries support either authentication pattern. If you're interested in [Passport](http://www.passportjs.org/), we also have examples for it using secure and encrypted cookies:

- [with-passport](https://github.com/vercel/next.js/tree/canary/examples/with-passport)
- [with-passport-and-next-connect](https://github.com/vercel/next.js/tree/canary/examples/with-passport-and-next-connect)

### Firebase

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/with-firebase-authentication">with-firebase-authentication</a></li>
  </ul>
</details>

When using Firebase Authentication, we recommend using the static generation pattern.

It is possible to use the Firebase Client SDK to generate an ID token and forward it directly to Firebase's REST API on the server to log-in. However, requests to Firebase might take some time to resolve, depending on your user's location.

You can either use [FirebaseUI](https://github.com/firebase/firebaseui-web-react) for a drop-in UI, or create your own with a [custom React hook](https://usehooks.com/useAuth/).

### Magic (Passwordless)

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/with-magic">with-magic</a></li>
  </ul>
</details>

[Magic](https://magic.link/), which uses [passwordless login](https://magic.link/), supports the static generation pattern. Similar to Firebase, a [unique identifier](https://w3c-ccg.github.io/did-primer/) has to be created on the client-side and then forwarded as a header to log-in. Then, Magic's Node SDK can be used to exchange the indentifier for a user's information.

### Auth0

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/auth0">auth0</a></li>
  </ul>
</details>

[Auth0](https://auth0.com/) can support both authentication patterns. You can also utilize [API routes](/docs/api-routes/introduction.md) for logging in/out and retrieving user information. After logging in using the [Auth0 SDK](https://github.com/auth0/nextjs-auth0), you can utilize static generation or `getServerSideProps` for server-side rendering.

### Supabase

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/with-supabase-auth-realtime-db">with-supabase-auth-realtime-db</a></li>
  </ul>
</details>

[Supabase](https://supabase.io/) is an open source Firebase alternative that supports many of its features, including authentication. It allows for row level security using JWT tokens and supports third party logins. Either authentication pattern is supported.

### Userbase

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/with-userbase">with-userbase</a></li>
  </ul>
</details>

[Userbase](https://userbase.com/) supports the static generation pattern for authentication. It's open source and allows for a high level of security with end-to-end encryption. You can learn more about it in their [official site](https://userbase.com/).

### SuperTokens

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/with-supertokens">with-supertokens</a></li>
  </ul>
</details>

[SuperTokens](https://supertokens.io) is a highly customizable, open-source solution split into modules (so you only use what you need).
SuperTokens currently supports credentials login, email verification, password reset flows, third-party logins, and cookie based sessions with rotating refresh tokens.

## Related

For more information on what to do next, we recommend the following sections:

<div class="card">
  <a href="/docs/basic-features/pages.md">
    <b>Pages:</b>
    <small>Learn more about pages and the different pre-rendering methods in Next.js.</small>
  </a>
</div>

<div class="card">
  <a href="/docs/basic-features/data-fetching.md">
    <b>Data Fetching:</b>
    <small>Learn more about data fetching in Next.js.</small>
  </a>
</div>
