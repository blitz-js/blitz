const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
// const Memory = require("lowdb/adapters/Memory")

declare global {
  // eslint-disable-next-line
  namespace NodeJS {
    interface Global {
      db: any
    }
  }
}

let db = global.db || low(new FileSync('db.json'))
global.db = db

db.defaults({
  users: [{ id: 1 }],
  sessions: [],
}).write()

export default db
