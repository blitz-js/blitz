import {setupBlitzServer} from "@blitzjs/next"
import {BlitzLogger} from "blitz"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [],
  log: {
    logger: BlitzLogger({}),
  },
})

export {gSSP, gSP, api}
