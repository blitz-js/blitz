const symlinkDir = require("symlink-dir")
const path = require("path")

symlinkDir("node_modules/@blitzjs/next", "node_modules/next")
  .then((result) => {
    // console.log(result)
  })
  .catch((err) => console.error(err))
