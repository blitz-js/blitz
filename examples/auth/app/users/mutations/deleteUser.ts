import db, {UserDeleteArgs} from "db"

type DeleteUserInput = {
  where: UserDeleteArgs["where"]
}

export default async function deleteUser({where}: DeleteUserInput, ctx: Record<any, any> = {}) {
  const user = await db.user.delete({where})

  return user
}
