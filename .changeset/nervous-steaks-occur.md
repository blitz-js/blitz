---
"blitz": major
---

updating paginate.ts

the paginate function has been updated to allow for a more complex pagination model to be used.

the function now returns pageCount, pageSize, from and to params.

Developers who wish to use paginate components from ui packages such as chakra or mantine can do so.

No breaking changes are neccessary if developers use basic prev/next or infinite pagination
