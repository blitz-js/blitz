import * as fs from "fs-extra"
import * as path from "path"

function ext(jsx = false) {
  return fs.existsSync(path.resolve("tsconfig.json")) ? (jsx ? ".tsx" : ".ts") : ".js"
}

export const paths = {
  document() {
    return `app/pages/_document${ext(true)}`
  },
  app() {
    return `app/pages/_app${ext(true)}`
  },
  entry() {
    return `app/pages/index${ext(true)}`
  },
  babelConfig() {
    return "babel.config.js"
  },
  blitzConfig() {
    return "blitz.config.js"
  },
}
