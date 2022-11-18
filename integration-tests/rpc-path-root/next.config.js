const {withBlitz} = require("@blitzjs/next")
module.exports = withBlitz({
  blitz: {
    resolverPath: "root",
    includeRPCFolders: ["../no-suspense/app"],
  },
})
