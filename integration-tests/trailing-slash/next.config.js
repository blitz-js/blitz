const {withBlitz} = require("@blitzjs/next")
module.exports = withBlitz({
  reactOnRecoverableError: () => {},
  trailingSlash: true,
})
