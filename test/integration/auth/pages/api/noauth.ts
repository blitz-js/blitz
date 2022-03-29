import {api} from "../../src/server-setup"

export default api(async (_req, res, ctx) => {
  res.status(200).end()
})
