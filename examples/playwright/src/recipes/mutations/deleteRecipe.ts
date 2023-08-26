import { resolver } from "@blitzjs/rpc"
import db from "db"
import { DeleteRecipeSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(DeleteRecipeSchema),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const recipe = await db.recipe.deleteMany({ where: { id } })

    return recipe
  }
)
