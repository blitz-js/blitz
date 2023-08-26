import { resolver } from "@blitzjs/rpc"
import db from "db"
import { UpdateRecipeSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateRecipeSchema),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const recipe = await db.recipe.update({ where: { id }, data })

    return recipe
  }
)
