const symlinkDir = require("symlink-dir")
const path = require("path")
const fs = require("fs")

const isInBlitzMonorepo = fs.existsSync(path.join(__dirname, "../test"))

if (!isInBlitzMonorepo) {
  const nodeModulesPath = path.join(__dirname, "../../")
  symlinkDir(path.join(nodeModulesPath, "@blitzjs/next"), path.join(nodeModulesPath, "next"))
    .then((result) => {
      // console.log(result)
    })
    .catch((err) => console.error(err))
}
