---
"@blitzjs/auth": patch
"blitz": patch
---

Fix a long-standing issue with occasional blitz auth flakiness

This bug would sometimes cause users to be logged out or to experience an CSRFTokenMismatchError. This bug, when encountered, usually by lots of setPublicData or session.create calls, would not set the cookie headers correctly resulting in cookies being set to a previous state or in a possibly undefined state.

There are no security concerns as far as I can tell.
