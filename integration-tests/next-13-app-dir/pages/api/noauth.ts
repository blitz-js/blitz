import {api} from "../../src/blitz-server"

export default api(async (_req, res, ctx) => {
  res.status(200).end()
})
