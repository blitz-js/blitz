---
"@blitzjs/auth": patch
---

I have changed User model in all of Prisma's schemas. I've changed the role key, changing it from a single string to an array of string called "roles". Then, I've changed all of functions where user is created to grant him a default roles array ["user"] instead of a single string "user". I've also changed all of types that where related to User's role and I've changed line 351 of file "blitz/packages/blitz-auth/src/client/index.tsx", to make the condition accept an array of string for roles.
