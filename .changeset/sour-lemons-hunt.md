---
"@blitzjs/auth": patch
"blitz": patch
---

Fix auth issue where session token and publicData cookie were updated unnecessarily, leading to potential user logout

- Previously, we were updating the session token each time public data changed. This is not needed, and it would cause race condition bugs where a user could be unexpectedly logged out because a request already in flight would not match the new session token.
- Previously, we were updating the publicData cookie even when it hadn't changed. This may reduce unnecessary re-renders on the client.
