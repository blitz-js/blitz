import {Low, JSONFile} from "lowdb"
import {dirname, join} from "node:path"
import {fileURLToPath} from "node:url"

declare global {
  namespace NodeJS {
    interface Global {
      db: Low<any>
    }
  }
}

// File path
const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, "db.json")

const adapter = new JSONFile(file)
const db = new Low(adapter)

global.db = db

db.data = {
  users: [
    {
      id: 1,
    },
  ],
  sessions: [],
}

export default db
