import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

export default async function getPosts(options: z.infer<typeof BrowseParams>, ctx: Ctx) {
  const posts = await ctx.ghost.posts.browse(options)
  return posts
}
