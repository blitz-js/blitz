const {withBlitz} = require("@blitzjs/next")
module.exports = withBlitz({
  reactOnRecoverableError: () => {},
  target: "experimental-serverless-trace",
})
