import {Ctx} from "blitz"

export default async function trackView(_: any, {session}: Ctx) {
  const currentViews = session.views || 0
  await session.$setPublicData({views: currentViews + 1})
  await session.$setPrivateData({views: currentViews + 1})

  return
}
