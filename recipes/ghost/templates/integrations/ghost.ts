import GhostContentAPI from "@tryghost/content-api"

export const ghostApi = new GhostContentAPI({
  url: process.env.GHOST_URL as string,
  version: "v3",
  key: process.env.GHOST_KEY as string,
})
