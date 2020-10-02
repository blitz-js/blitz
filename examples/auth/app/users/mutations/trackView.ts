import {Ctx, NotFoundError} from "blitz"

export default async function trackView(_ = null, {session}: Ctx) {
  const currentViews = session.publicData.views || 0
  await session.setPublicData({views: currentViews + 1})
  await session.setPrivateData({views: currentViews + 1})

  throw new Error("help")

  return
}
