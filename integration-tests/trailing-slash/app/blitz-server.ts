import {setupBlitzServer} from "@blitzjs/next"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [],
})

export {gSSP, gSP, api}
