import {AuthenticationError} from "blitz"
import {getBlitzContext} from "../../src/blitz-server"

export default async function Home() {
  const ctx = await getBlitzContext()
  if (!ctx.session.userId) {
    const error = new AuthenticationError("You are not authenticated")
    error.stack = ""
    throw error
  }
  return (
    <div>
      <h1>AuthenticatedQuery</h1>
    </div>
  )
}
