import {objectType, list} from "nexus"
import db from "db"
import {UserType} from "./user-type"

export const QueryType = objectType({
  name: "Query",
  definition(t) {
    t.field("allUsers", {
      type: list(UserType),
      resolve() {
        return db.user.findMany({select: {id: true, email: true, role: true}})
      },
    })
  },
})
