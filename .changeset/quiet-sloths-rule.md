---
"@blitzjs/next": patch
---

Removes the check for when withBlitz is mounted before rendering the users app. We had this previously to avoid the react 18 suspense error being showin in development with nextjs.
