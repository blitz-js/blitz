import Knex from "knex"
import { createDatabase } from "./createDatabase"

let knex: Knex | undefined = undefined

function getKnex() {
  return Knex({
    client: "sqlite3",
    connection: {
      filename: "./mydb.sqlite",
    },
  })
}

if (process.env.NODE_ENV === "production") {
  knex = getKnex()
} else {
  // Ensure the knex instance is re-used during hot-reloading
  // Otherwise, a new client will be created on every reload
  global["knex"] = global["knex"] || getKnex()
  knex = global["knex"]
}

export default knex

let alreadyCreatedDatabase = false

export async function connect() {
  if (alreadyCreatedDatabase) {
    return
  }

  await createDatabase(knex)
  alreadyCreatedDatabase = true
}
