import db from "db"
import { GIFModel } from "db/GIFModel"

export default async function addGIF(url: string) {
  await db<GIFModel>("gifs").insert({ url })
}
