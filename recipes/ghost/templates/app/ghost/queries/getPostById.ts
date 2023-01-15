import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

const GetPostById = z.object({
  id: z.string(),
  options: BrowseParams.optional(),
})

export default async function getPostById({id, options}: z.infer<typeof GetPostById>, ctx: Ctx) {
  const post = await ctx.ghost.posts.read(
    {
      id,
    },
    options,
  )
  return post
}
