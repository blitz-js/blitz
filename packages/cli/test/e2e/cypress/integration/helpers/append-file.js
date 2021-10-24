const fs = require("fs")

const filePath = process.cwd()

fs.appendFile(
  `${filePath}/app/types.ts`,
  "declare module 'react' { interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> { jsx?: boolean; global?: boolean }}",
  function (err) {
    if (err) throw err
  },
)
