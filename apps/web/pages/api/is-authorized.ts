import {api} from "app/blitz-server"

export default api(async (_req, res, ctx) => {
  const {session} = ctx

  const authorized = session.$isAuthorized()

  res.status(200).json({
    authorized,
  })
})
