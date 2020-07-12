import db from "db"
import { GIFModel } from "db/GIFModel"

export default async function getGIFs(): Promise<{ url: string; rating: number }[]> {
  return await db<GIFModel>("gifs")
    .select("url")
    .leftJoin("ratings", "ratings.gif_url", "gifs.url")
    .groupBy("url")
    .avg("rating as rating")
}
