import {objectType} from "nexus"
import {User} from "nexus-prisma"

export const UserType = objectType({
  name: User.$name,
  definition(t) {
    t.field(User.id.name, User.id)
    t.field(User.email.name, User.email)
    t.field(User.role.name, User.role)
  },
})
