import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

export default async function getTags(options: z.infer<typeof BrowseParams>, ctx: Ctx) {
  const tags = await ctx.ghost.tags.browse(options)
  return tags
}
