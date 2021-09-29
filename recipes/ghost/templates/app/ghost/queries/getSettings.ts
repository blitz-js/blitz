import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

export default async function getSettings(options: z.infer<typeof BrowseParams>, ctx: Ctx) {
  const settings = await ctx.ghost.settings.browse(options)
  return settings
}
