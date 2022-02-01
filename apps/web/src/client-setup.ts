import { setupClient } from "@blitzjs/next"
import { AuthPlugin } from "@blitzjs/auth"

const { withBlitz, useQuery, useSession, BlitzPage } = setupClient({
  plugins: [AuthPlugin({}), ZeroApiPlugin({})]
})

export { withBlitz, useQuery }

const p = [AuthPlugin({}), ZeroApiPlugin({})]

type _ = PluginsExports<typeof p>;
