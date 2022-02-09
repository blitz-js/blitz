import {api} from "../../src/server-setup"
import {SessionContext} from "@blitzjs/auth"
import {prisma} from "../../prisma/index"

export default api(async (req, res) => {
  const blitzContext = res.blitzCtx as {session: SessionContext}

  const user = await prisma.user.findFirst({where: {email: (req.query.email || "") as string}})
  if (!user) {
    res.status(404).json({message: "No user found"})
  }

  // log in
  await blitzContext.session.$create({
    userId: req.query.userId,
  })

  res.status(200).json({name: "John Doe", userId: blitzContext.session.userId})
})
