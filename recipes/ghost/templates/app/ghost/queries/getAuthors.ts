import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

export default async function getAuthors(params: z.infer<typeof BrowseParams>, ctx: Ctx) {
  const authors = await ctx.ghost.posts.browse(params)
  return authors
}
