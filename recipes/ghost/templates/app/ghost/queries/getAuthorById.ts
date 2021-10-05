import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

const GetAuthorById = z.object({
  id: z.string(),
  options: BrowseParams.optional(),
})

export default async function getAuthorById(
  {id, options}: z.infer<typeof GetAuthorById>,
  ctx: Ctx,
) {
  const author = await ctx.ghost.authors.read(
    {
      id,
    },
    options,
  )
  return author
}
