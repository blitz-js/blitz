---
"@blitzjs/generator": patch
---

Guard `blitz g` input via an allow-list of characters; throw if unwanted characters are found. Prevents to break the blitz command by accident (https://github.com/blitz-js/blitz/issues/4021).
