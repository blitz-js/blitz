---
"@blitzjs/auth": patch
"@blitzjs/next": patch
"blitz": patch
---

Ensure the component has mounted before throwing a redirect with redirectAuthenticatedTo. This will fix the hydration error from react.
