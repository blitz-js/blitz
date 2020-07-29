import RatingModel from "db/RatingModel"
import db from "db"

export default async function addRating(rating: RatingModel) {
  await db<RatingModel>("ratings").insert(rating)
}
