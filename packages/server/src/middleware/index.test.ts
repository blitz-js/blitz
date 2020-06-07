import {Middleware} from '.'

const customMiddleware: Middleware = async (req, res, next) => {
  res.blitzCtx.referrer = req.headers.referer

  await next()

  console.log('Query result:', res.blitzResult)
}
