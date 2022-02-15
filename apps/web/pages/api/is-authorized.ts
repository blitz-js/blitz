import {api} from "../../src/server-setup"
import {SessionContext} from "@blitzjs/auth"

export default api(async ({res, ctx}) => {
  const blitzContext = ctx as {session: SessionContext}

  const authorized = blitzContext.session.$isAuthorized()

  res.status(200).json({
    authorized,
  })
})
