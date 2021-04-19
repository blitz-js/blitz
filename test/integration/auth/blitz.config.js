const {sessionMiddleware, simpleRolesIsAuthorized} = require("blitz")
const db = require("./db")

module.exports = {
  middleware: [
    sessionMiddleware({
      isAuthorized: simpleRolesIsAuthorized,
      getSession: (handle) => db.get("sessions").find({handle}).value(),
      getSessions: (userId) => db.get("sessions").filter({userId}).value(),
      createSession: (session) => {
        return db.get("sessions").push(session).write()
      },
      updateSession: async (handle, session) => {
        return db.get("sessions").find({handle}).assign(session).write()
      },
      deleteSession: (handle) => db.get("sessions").remove({handle}).write(),
    }),
  ],
}
