const {withBlitz} = require("@blitzjs/next")
module.exports = withBlitz({
  middleware: [
    (req, res, next) => {
      res.setHeader("global-middleware", "true")
      return next()
    },
  ],
})
