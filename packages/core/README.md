# `core`

This package contains the application-facing offerings of BlitzJS.

Some of the fullstack features that are available include:

- Authentication Utilities
- React Hooks
- Session Management
- Wrappers for the data-layer communications (RPC)

## Usage

### Fetch data from a query

```js
import {useQuery} from "blitz"
import getUsers from "app/users/queries/getUsers"

const Users = () => {
  const [users] = useQuery(getUsers, {})

  return <pre style={{maxWidth: "30rem"}}>{JSON.stringify(users, null, 2)}</pre>
}
```

### Session Context

```ts
import {Ctx} from "blitz"

export default async function trackView(_ = null, {session}: Ctx) {
  const currentViews = session.publicData.views || 0
  await session.setPublicData({views: currentViews + 1})
  await session.setPrivateData({views: currentViews + 1})

  return
}
```
