---
"@blitzjs/codemod": patch
---

Fix upgrade-legacy codemod replacing identifiers with an invalid value. Previously new values were hardcoded to `NextApiRequest`. Now we're using correct values provided as `replaceIdentifiers` function argument.
