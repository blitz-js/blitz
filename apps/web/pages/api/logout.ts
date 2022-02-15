import {api} from "../../src/server-setup"
import {SessionContext} from "@blitzjs/auth"

export default api(async ({res, ctx}) => {
  const blitzContext = ctx as {session: SessionContext}

  await blitzContext.session.$revoke()

  res.status(200).json({userId: blitzContext.session.userId})
})
