# [RFC] Blitz Auth Session Management

Authentication has two key components:

1. Identity verification
   1. This is the process of verifying that someone is who they say they are, usually performed via username/password or OAuth.
2. Session management
   1. This is the process of securing multiple requests by the same user, usually performed via cookies or http headers.
   2. Once a session is created, subsequent requests verify the _session_, not the user.
   3. Without session management, the user would have to enter their username/password on each request.

This RFC only addresses the second part, session management. We plan to post another RFC for identity verification, but it will be fully swappable/pluggable with a default of self-hosted username/password.

## Preface

This RFC is almost entirely put together by [Rishabh Poddar](https://twitter.com/rishpoddar), the Co-founder and CTO of [Supertokens](https://supertokens.io/). He'll also lead the actual implementation. Thank you so much Rishabh!!!!

## Table of Contents

- [Objectives](#objectives)
- [Two Security Levels](#two-security-levels)
- [Essential: Opaque token stored in the database](#essential-opaque-token-stored-in-the-database)
  - [Blitz Developer Interface](#blitz-developer-interface)
    - [Access Session Data in UI Components](#access-session-data-in-ui-components)
    - [Login Mutation](#login-mutation)
    - [Logout Mutation](#logout-mutation)
    - [Accessing Session Data in Queries/Mutations](#accessing-session-data-in-queriesmutations)
    - [Using Session Handles (For advanced use cases)](#using-session-handles-for-advanced-use-cases)
  - [Implementation Details](#implementation-details)
    - [Session Creation](#session-creation)
    - [Session Verification](#session-verification)
    - [Session Revocation/Logout](#session-revocationlogout)
    - [Session Middleware](#session-middleware)
- [Advanced: Short lived JWTs plus refresh tokens](#advanced-short-lived-jwts-plus-refresh-tokens)
  - [Blitz Developer Interface](#blitz-developer-interface-1)
  - [Implementation Details](#implementation-details-1)
    - [Session Creation](#session-creation-1)
    - [Session Verification](#session-verification-1)
    - [Session Refreshing](#session-refreshing)
    - [Session Revocation/Logout](#session-revocationlogout-1)
    - [Why is this more secure?](#why-is-this-more-secure)
    - [Why not only have the advanced JWT method?](#why-not-only-have-the-advanced-jwt-method)
- [Anonymous Sessions](#anonymous-sessions)
- [Authorization](#authorization)
- [Other Use Cases &amp; Interfaces](#other-use-cases--interfaces)
- [Security &amp; Auditing](#security--auditing)

## Objectives

1. Enable login and logout functionality.
2. Ability to easily set session inactivity timeout length (potentially for an "infinite" amount of time).
3. By default, prevent against:
   - CSRF: Can be switch off on a per endpoint basis.
   - XSS
   - Brute force
   - Database session theft: Even if an attacker gets the session tokens from the db, they should not be able to hijack those user's accounts.
4. Allow users to revoke a session
5. Allow multiple devices per logged in user
6. Anonymous sessions
7. Easily allow advanced session operations like:
   - Limit number of devices a user can login with
   - Sync session data across devices
   - Keep user session data intact across login / logout (to be thought about)
8. Optionally provide significantly more security by detecting token theft as per [this RFC](https://tools.ietf.org/html/rfc6749#section-10.4). This will be inspired by [SuperTokens.io](https://supertokens.io?s=bl)'s implementation of sessions. [Here](https://docs.google.com/spreadsheets/d/14h9qd2glE31HSGUofx43XwfJHZNzgkdCwEKl-3UcXLE/edit?usp=sharing) are all the ways tokens can be stolen.

## Two Security Levels

Blitz session management will have two methods with different tradeoffs on complexity and security:

1. **Essential: Opaque token stored in the database**
   1. This works the same as traditional fullstack frameworks like Rails
   2. Great security and usability for most apps
   3. Works great with SSR
2. **Advanced: Short lived JWTs plus refresh tokens**
   1. For apps with special operational security needs
   2. For apps with extreme scalability needs where they can't make a DB request to verify each session
   3. Can work with SSR, but requires some extra client side redirect pages for refreshing tokens

Both methods send access tokens to the frontend via `httpOnly`, `secure` cookies. Separately, the anti-csrf token will be sent to the frontend via HTTP response headers.

## Essential: Opaque token stored in the database

This will be the default security level for new Blitz apps.

### Blitz Developer Interface

#### Access Session Data in UI Components

```ts
import {useSession} from "blitz"
// These are regular Blitz mutations
import login from "app/modules/auth/mutations/login"
import logout from "app/modules/auth/mutations/logout"

export default function AccountComponent() {
  // This hook returns the `publicData` session object (see Login Mutation below)`
  const session = useSession()

  if (session.userId) {
    return (
      <div>
        You are logged in as {session.userId} with role {session.role}
        <button onClick={logout}>Logout</button>
      </div>
    )
  } else {
    return (
      <div>
        <button onClick={login}>Login</button>
      </div>
    )
  }
}
```

#### Login Mutation

```ts
// app/modules/auth/mutations/login.ts

export default async function login(args: UserCredentials, ctx: Context) {
  // Perform identity verification here
  //   - username/password, auth0, OAuth, etc
  //   - This will covered in another RFC
  let user // = ??? returned from identity verification

  try {
    await ctx.session.create({
      // publicData will be accessible by frontend code with the `useSession()` hook
      // Put anything here that's not sensitive
      publicData: {
        userId: user.id, // required
        role: "admin", // required
        teamIds: user.teams.map((team) => team.id),
      },
      // privateData is stored in the DB with the session and is not directly
      // accessible by the frontend. A DB request is required to get this data
      // An example could be shopping cart items
      privateData: {
        /* ... */
      },
    })

    // successfully created a session.
  } catch (err) {
    // log and throw an error
  }
}
```

#### Logout Mutation

```ts
// app/modules/auth/mutations/logout.ts

export default async function logout(args: SomArgs, ctx: Context) {
  // The following will take care of clearing all cookies.
  // for anonymous sessions, this is a noop.
  // if the session does not exist, the function below will not throw any error.
  await ctx.session.revoke()
}
```

#### Accessing Session Data in Queries/Mutations

```ts
// app/modules/products/queries/getProducts.ts

export default async function getProducts(args: SomArgs, ctx: Context) {
  // Read the userId
  let userId = ctx.session.userId

  // Example on how to read/set session publicData
  let publicSessionData = await ctx.session.getPublicData()
  await ctx.session.setPublicData({...publicSessionData /* ... some new data */})

  // Example on how to read/set session privateData
  let privateSessionData = await ctx.session.getPrivateData()
  await ctx.session.setPrivateData({
    ...privateSessionData,
    // ... some new data
  })

  if (ctx.session.role === "admin") {
    return await db.product.findMany()
  } else {
    return await db.product.findMany({where: {published: true}})
  }
}
```

#### Using Session Handles (For advanced use cases)

You can get all session handles belonging to a user. With these handles you can:

1. Get and set private data of that session handle
2. Revoke that session handle - logging the user out of that device
3. Revoke all sessions belonging to a user.

```ts
// app/modules/auth/queries/exampleQuery.ts
import {Session} from "blitz"

export default async function exampleQuery(args: SomArgs, ctx: Context) {
  // this is a unique ID per session
  let sessionHandle = ctx.session.handle

  // Can revoke all session for a user
  await Session.revokeAllSessionsForUser(ctx.session.userId)

  // Can get all sessions for a user and loop through them
  let allSessionsForThisUser: string[] = await Session.getAllSessionHandlesForUser(
    ctx.session.userId,
  )
  for (let session of allSessionsForThisUser) {
    try {
      // Can use publicData to get the role or other public info of this session.
      let publicData = await Session.getPublicData(session)

      // Can change publicData for this session
      await Session.setPublicData(session, {...publicData /* ... */})

      // get private session data for this session
      let privateData = await Session.getPrivateData(session)

      // Can change privateData for this session
      await Session.setPrivateData(session, {...privateData /* ... */})

      // Log user out of this specific device
      await Session.revokeSessions([session])
    } catch (err) {
      if (Session.Error.isUnauthorized(err)) {
        // This session has been revoked
      } else {
        // some generic error.
      }
    }
  }
}
```

### Implementation Details

#### Session Creation

- After login, the server will create an opaque token. This will be a random, 32 character long `string`. It will also create an anti-csrf token which will also be 32 characters long. The final access token will be a concatenation of these two strings.
- This token will be sent to the frontend via `httpOnly`, `secure` cookies. Separately, the anti-csrf token will be sent to the frontend via response headers.
- The anti-csrf token must be stored in the localstorage on the frontend.
- The SHA256 hash of the access token will be stored in the database. This token will have the following properties mapped to it:
  - userId
  - anti-csrf token
  - expiry time
  - session data (this can be manipulated via the Blitz session API).
- Creating a new session while another one exists results in the headers / cookies changing. However, the older session will still be alive.
- For serious production apps, a cronjob will be needed to remove all expired tokens on a regular basis.

#### Session Verification

- For each request that requires CSRF protection, the frontend must read the localstorage and send the anti-csrf token in the request header.
- An incoming access token can be verified by checking that it's in the db and that it has not expired. After each verification, the expiry time of the access token updated asynchronously (and in a lock free way).
- CSRF attack protection can be done checking that the incoming anti-csrf token (from the header) is what is associated with the session.
- Once verified, the Blitz queries/mutations can easily get the userId associated with the session and also manipulate the session data.

#### Session Revocation/Logout

- This is easily done by deleting the session from the database.
- This is also how user logout will be implemented. Furthermore, cookies will be cleared, and a header will be sent signaling to the frontend to remove the anti-csrf token from the localstorage

#### Session Middleware

**Blitz developers don't have to implement this middleware.** This middleware will be provided by Blitz. It is shown here for those who are curious.

This is rough pseudo code, exact details will change.

```ts
// internal middleware file
import {Session, BlitzApiRequest, BlitzApiResponse} from 'blitz'

type SessionType = {
    userId: string | null, // will be null if anonymous
    role: string,  // will be "public" if session is anonymous.
    create: ({
        publicData: {
            userId: string
            role: string
            [propName: string]: any
        },
        privateData?: Object
    }) => Promise<SessionType>,
    revoke: () => Promise<void>,    // if anonymous, this will fo nothing.
    getPrivateData: () => Promise<object>,
    setPrivateData: (data: object) => Promise<void>,
    getPublicData: () => object,
    handle: string,
    regenerate({
        publicData: {
            userId?: string
            role?: string
            [propName: string]: any
        },
    }) => Promise<SessionType>
}

// NOTE: Ignore this middleware API, the middleware API itself will likely change
export const middleware = [
  (req: BlitzApiRequest, res: BlitzApiResponse): SessionType => {
    try {
        let enableCsrfProtection = req.method !== "GET" && req.method !== "OPTIONS";

        // Adds session object to the ctx
        return await Session.getSession(req, res, enableCsrfProtection);
    } catch (err) {
        if (Session.Error.isUnauthorized(err)) {
            if (Session.Error.isAntiCSRFTokenFailed(err)) {
                throw err;
            }
        } else {
            throw err;
        }
    }

    // Create an anonymous session if enabled
    // the role here will be "public"
    // Adds session object to the ctx
    return Session.createAnonymousSession(req, res);
  }
]
```

## Advanced: Short lived JWTs plus refresh tokens

This is significantly more secure than the essential method, but adds extra complexity than the above method because it requires refreshing of tokens.

### Blitz Developer Interface

Same as the essential method, but with a few additions:

- An extra http endpoint for refreshing tokens
- A callback function for when token theft is detected (ideally where custom error handlers are defined). We will provide a default implementation in which the affected session will be revoked, logging out the victim and the attacker.
  ```
  Session.onTokenTheft((sessionHandle: string, userId: string, req: BlitzApiRequest, res: BlitzApiResponse) => {
    // can revoke this session using sessionHandle
    // OR
    // can revoked all sessions belonging to userId
    // OR
    // send an email alert to the user etc..
  })
  ```

### Implementation Details

#### Session Creation

- After login, the server will create a short lived JWT (access token) and a long lived opaque token (called refresh token). An opaque token is a random string that doesn't mean anything. It only acts as a pointer to the session data stored in the database.
- The JWT will be generated by a shared secret key. This secret key will be automatically changed from time to time for security purposes. It is very important to keep this key secure, because if it is compromised, then an attacker can easily assume the identity of any user in the system.
- A hashed version of the opaque token will be stored in the database similar to the essential method described above.
- Both these tokens will be sent to the frontend client via `httpOnly`, `secure` cookies. The access token will be sent to all APIs, whereas the refresh token will only be sent to the refresh API.
- The server will also create an anti-csrf token that is sent to the frontend via headers and is also a part of the JWT claims. This token is stored in the localstorage on the frontend.

#### Session Verification

- The access token is sent for each API call.
- Verification is implemented by checking the signature of the JWT, as well as the expiration time.
- CSRF protection is done by checking the incoming anti-csrf token is the same as what's in the JWT. This can be disabled on a per API basis.

#### Session Refreshing

- When the access token expires, a call needs to be made to the refresh API with the refresh token.
- If the refresh token is valid (not expired, and in the database), then a new JWT and a new refresh token is sent to the frontend.
- From a security point of view, it is important that we also send a new refresh token. If we do not do that, then this flow is the same as the essential method (from a security point of view).

#### Session Revocation/Logout

- This is easily done by deleting the refresh session from the database.
- This is also how user logout will be implemented. Furthermore, cookies will be cleared, and a header will be sent signaling to the frontend to remove the anti-csrf token from the localstorage.
- Because we are using JWTs, technically, the session is not completely revoked immediately. A malicious user can still access the APIs with that JWT. Once the JWT expires (which has a very short lifetime), then the session will be completely revoked. This seems to provide a good balance between security and scalability. The alternative is to use opaque tokens instead of JWTs as the access token.

#### Why is this more secure?

This question is answered in this 2 part [blog post](https://supertokens.io/blog/all-you-need-to-know-about-user-session-security). This method also detects session hijacking which can occur in all the following ways as mentioned [here](https://docs.google.com/spreadsheets/d/14h9qd2glE31HSGUofx43XwfJHZNzgkdCwEKl-3UcXLE/edit?usp=sharing).

#### Why not only have the advanced JWT method?

Because this advanced method is not friendly for server side rendering. It can be done, but it negatively impacts the user experience because it requires client-side page redirects for token refreshing. (Page redirects are not required if not using SSR)

In the future, we might enable this advanced method by default for new apps.

## Anonymous Sessions

A "draft" session will be created for all anonymous users. A session will be created and cookies sent to the client, but the session will not be saved in the database until you call `ctx.session.setPrivateData()`. The `ctx.session` object for anonymous users will be:

```js
// Default with anonymous sessions:
{
  handle: null,
  userId: null,
  role: "public"
}
```

One use case for this is saving shopping cart items for anonymous users. If an anonymous user later signs up or logs in, the anonymous session data can be merged into their new authenticated session.

## Authorization

We want to be able to associate roles to sessions. There are many ways of doing this, but by default, we will allow just on role per session. This role information can be stored in the database along with the other session information.

We could have allowed a session to have multiple roles, but then this can easily cause conflicts and make the system vastly more complex. If the user needs to do this, they will have to use a third party service or build it themselves.

If a session's role changes, we should allow for the regeneration of the session token. This is a security best practice and is also recommended by OWASP.

**We plan to post a separate full RFC on Authorization**

## Other Use Cases & Interfaces

We have a plan for tackling these use cases, but we need a bit more time to figure out the best API interface.

- Changing a user's role
- Database access hooks for using our session management with any data persistence solution (any DB or third-party API). Blitz database plugins will be able to set these hooks, for example.
- Session regeneration (future)

## Security & Auditing

We are writing a new library from scratch that's designed specifically for Blitz. This obviously has a level of risk, but we're in this for the long term and think this is the approach that will serve us the best.

This new library uses the same proven approach to secure, scalable session management as the existing [Supertokens](https://supertokens.io/) library. The Supertokens library implements best practices as per OWASP and IETF’s RFC6819. It has been unofficially audited by numerous third-parties and found to be extremely secure. That said, it doesn't yet have any official certifications.

We are committed to obtaining third-party security audits, so Blitz developers can fully rely on it.

If you know anyone interested in helping with or sponsoring security audits, please contact Brandon Bayer at b@bayer.ws
