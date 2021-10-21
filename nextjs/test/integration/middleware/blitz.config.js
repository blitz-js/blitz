// @ts-check

/**
 * @type {import('next/dist/server/config').NextConfig}
 **/
const config = {
  middleware: [
    (req, res, next) => {
      res.setHeader('global-middleware', 'true')
      return next()
    },
  ],
  future: {},
  experimental: {},
}
module.exports = config
