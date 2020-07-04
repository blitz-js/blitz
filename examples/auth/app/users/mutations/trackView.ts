import {SessionContext} from "blitz"

export default async function trackView(_ = null, ctx: {session?: SessionContext} = {}) {
  const currentViews = ctx.session.publicData.views || 0
  await ctx.session.setPublicData({views: currentViews + 1})

  console.log("private data:", await ctx.session.getPrivateData())
  await ctx.session.setPrivateData({views: currentViews + 1})

  return
}
