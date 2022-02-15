import {api} from "../../src/server-setup"
import {SessionContext, setPublicDataForUser} from "@blitzjs/auth"
import {prisma} from "../../prisma/index"

export default api(async ({req, res, ctx}) => {
  const blitzContext = ctx as {session: SessionContext}

  await prisma.user.update({
    where: {id: blitzContext.session.userId as number},
    data: {role: req.query.role as string},
  })
  await setPublicDataForUser(blitzContext.session.userId, {role: req.query.role as string})

  res.status(200).json({userId: blitzContext.session.userId, role: req.query.role as string})
})
