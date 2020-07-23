import type Knex from "knex"
import { GIFModel } from "./GIFModel"
import RatingModel from "./RatingModel"

export async function createDatabase(knex: Knex) {
  await knex.schema.createTableIfNotExists("gifs", (table) => {
    table.string("url").primary().notNullable()
  })

  await knex.schema.createTableIfNotExists("ratings", (table) => {
    table.increments()
    table.string("gif_url").references("gifs.url").notNullable()
    table.enum("rating", [1, 2, 3, 4, 5]).notNullable()
  })

  try {
    await knex<GIFModel>("gifs").insert([
      { url: "https://media.giphy.com/media/kreQ1pqlSzftm/giphy.gif" },
      { url: "https://media.giphy.com/media/10vk5L8tHKN1UQ/giphy.gif" },
    ])
  } catch (error) {
    // ignore
  }

  const [{ count }] = await knex("ratings").count("id as count")
  if (count === 0) {
    await knex<RatingModel>("ratings").insert([
      { gif_url: "https://media.giphy.com/media/kreQ1pqlSzftm/giphy.gif", rating: 4 },
      { gif_url: "https://media.giphy.com/media/kreQ1pqlSzftm/giphy.gif", rating: 5 },
      { gif_url: "https://media.giphy.com/media/10vk5L8tHKN1UQ/giphy.gif", rating: 3 },
      { gif_url: "https://media.giphy.com/media/10vk5L8tHKN1UQ/giphy.gif", rating: 2 },
      { gif_url: "https://media.giphy.com/media/10vk5L8tHKN1UQ/giphy.gif", rating: 5 },
    ])
  }
}
