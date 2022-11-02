import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  // Validate the input data
  // Ensure user is logged in
  resolver.authorize(), // just to see the warning to switch to auth plugin
  // Perform business logic
  async () => {
    const project = db.user.findMany()
    return project
  }
)

export const config = {
  httpMethod: "GET",
}
