---
"blitz": minor
"@blitzjs/auth": minor
"@blitzjs/next": minor
"@blitzjs/rpc": minor
---

- New Blitz Auth Function `getAppSession`, This function will use the cookies and headers provided by the server component and returns the current session.
- New Blitz Auth Hook `useAuthenticatedAppSession`, This hook is implemented as the replacement of the BlitzPage seurity auth utilities provided for the pages directory to work with React Server Components in the Nextjs 13 app directory
- New Blitz React Server Component Wrapper, `BlitzProvider` is to be imported from setupBlitzClient in src/blitz-client.ts and to used to ideally wrap the entire application in the `RootLayout` in the root layout.ts file of next app directory.
- Fix failing tests due to the error `NextRouter is not mounted` in next 13 blitz apps
