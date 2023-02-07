const {withBlitz} = require("@blitzjs/next")
module.exports = withBlitz({
  blitz: {
    includeRPCFolders: ["../no-suspense/app"],
  },
})
