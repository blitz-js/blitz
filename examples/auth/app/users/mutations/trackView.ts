import {SessionContext} from "blitz"
import {getConfig} from "@blitzjs/config"
import pkgDir from "pkg-dir"
import fs from "fs"
import path from "path"

export default async function trackView(_ = null, ctx: {session?: SessionContext} = {}) {
  const projectRoot = pkgDir.sync() || process.cwd()
  console.log("projectRoot", projectRoot)

  console.log("db", path.resolve("db"))
  console.log("db2", path.resolve("/var/task/.next/server/__db.js"))
  console.log("config1", path.resolve("blitz.config.js"))
  console.log("config2", path.resolve("next.config.js"))

  const config = getConfig()
  console.log("config", config)

  console.log("files", fs.readdirSync(projectRoot))
  console.log(".next", fs.readdirSync("/var/task/.next"))
  console.log("serverless", fs.readdirSync("/var/task/.next/serverless"))

  const currentViews = ctx.session!.publicData.views || 0
  await ctx.session!.setPublicData({views: currentViews + 1})
  await ctx.session!.setPrivateData({views: currentViews + 1})

  return
}
