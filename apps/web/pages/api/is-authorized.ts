import {api} from "../../src/server-setup"
import {SessionContext} from "@blitzjs/auth"

export default api(async (req, res) => {
  const blitzContext = res.blitzCtx as {session: SessionContext}

  const authorized = blitzContext.session.$isAuthorized()

  res.status(200).json({
    authorized,
  })
})
