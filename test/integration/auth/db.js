const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")
// const Memory = require("lowdb/adapters/Memory")

let db = global.db || low(new FileSync("db.json"))
global.db = db

db.defaults({
  users: [{id: 1, email: "user@example.com", hashedPassword: "??"}],
  sessions: [],
}).write()

module.exports = db
