const symlinkDir = require("symlink-dir")
const path = require("path")

const nodeModulesPath = path.join(__dirname, "../../")
symlinkDir(path.join(nodeModulesPath, "@blitzjs/next"), path.join(nodeModulesPath, "next"))
  .then((result) => {
    // console.log(result)
  })
  .catch((err) => console.error(err))
