import {LowSync, JSONFileSync} from "lowdb"
import {join} from "path"

declare global {
  namespace NodeJS {
    interface Global {
      db: any
    }
  }
}

const file = join(process.cwd(), "db/db.json")
console.log(file)
const adapter = new JSONFileSync(file)
const db = new LowSync(adapter)

db.data ||= {
  users: [{id: 1}],
  sessions: [],
}

db.write()

export default db
