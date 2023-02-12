import {NotFoundError} from "blitz"
import db from "../../../prisma"
// import {authenticateUser} from "./login"
import {ChangePassword} from "../validations"
import {resolver} from "@blitzjs/rpc"
// import {SecurePassword} from "@blitzjs/auth"

export default resolver.pipe(
  //@ts-ignore
  resolver.zod(ChangePassword),
  resolver.authorize(),
  async ({currentPassword, newPassword}, ctx) => {
    const user = await db.user.findFirst({where: {id: ctx.session.userId}})
    if (!user) throw new NotFoundError()

    // await authenticateUser(user.email, currentPassword)

    // const hashedPassword = await SecurePassword.hash(newPassword.trim())
    await db.user.update({
      where: {id: user.id},
      data: {hashedPassword: newPassword},
    })

    return true
  },
)
