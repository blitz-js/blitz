import {setPublicDataForUser} from "@blitzjs/auth"

import {api} from "../../src/server-setup"
import {prisma} from "../../prisma/index"

export default api(async (req, res, ctx) => {
  if (ctx.session.$thisIsAuthorized()) {
    ctx.session.$publicData

    await prisma.user.update({
      where: {id: ctx.session.userId as number},
      data: {role: req.query.role as string},
    })
    await setPublicDataForUser(ctx.session.userId, {role: req.query.role as string})
  }

  res.status(200).json({userId: ctx.session.userId, role: req.query.role as string})
})
