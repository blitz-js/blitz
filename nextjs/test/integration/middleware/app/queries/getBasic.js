export const middleware = [
  (req, res, next) => {
    res.setHeader('local-middleware', 'true')
    return next()
  },
]

export default async function getBasic() {
  return 'basic-result'
}
