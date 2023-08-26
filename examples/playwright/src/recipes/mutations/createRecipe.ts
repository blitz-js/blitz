import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CreateRecipeSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(CreateRecipeSchema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const recipe = await db.recipe.create({ data: input })

    return recipe
  }
)
