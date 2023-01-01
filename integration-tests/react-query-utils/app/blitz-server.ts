import {setupBlitzServer} from "@blitzjs/next"
import db from "../db"
import {BlitzLogger} from "blitz"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [],
  logger: BlitzLogger({}),
})

export {gSSP, gSP, api}
