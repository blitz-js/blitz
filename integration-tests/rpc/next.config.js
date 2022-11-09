const {withBlitz} = require("@blitzjs/next")
module.exports = withBlitz({
  target: "experimental-serverless-trace",
  blitz: {
    includeRPCFolders: ["../no-suspense/app"],
  },
})
