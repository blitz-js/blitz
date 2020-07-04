import {SessionContext} from "blitz"

export default async function trackView(_ = null, ctx: {session?: SessionContext} = {}) {
  let currentViews
  if (!ctx.session.userId) {
    console.log("[trackView] setting public data")
    currentViews = ctx.session.publicData.views || 0
    await ctx.session.setPublicData({views: currentViews + 1})
  }

  console.log("private data:", await ctx.session.getPrivateData())
  await ctx.session.setPrivateData({views: (currentViews || 0) + 1})

  return
}
