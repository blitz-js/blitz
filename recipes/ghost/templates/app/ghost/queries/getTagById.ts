import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

const GetTagById = z.object({
  id: z.string(),
  options: BrowseParams.optional(),
})

export default async function getTagById({id, options}: z.infer<typeof GetTagById>, ctx: Ctx) {
  const tag = await ctx.ghost.tags.read(
    {
      id,
    },
    options,
  )
  return tag
}
