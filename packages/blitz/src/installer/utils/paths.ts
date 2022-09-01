import * as fs from "fs-extra"
import * as path from "path"

function ext(jsx = false) {
  return fs.existsSync(path.resolve("tsconfig.json")) ? (jsx ? ".tsx" : ".ts") : ".js"
}

export const paths = {
  document() {
    return `pages/_document${ext(true)}`
  },
  app() {
    return `pages/_app${ext(true)}`
  },
  blitzServer() {
    return `app/blitz-server${ext(false)}`
  },
  blitzClient() {
    return `app/blitz-client${ext(false)}`
  },
  entry() {
    return `pages/index${ext(true)}`
  },
  nextConfig() {
    return `next.config.js`
  },
  babelConfig() {
    return `babel.config.js`
  },
  packageJson() {
    return "package.json"
  },
  prismaSchema() {
    return "db/schema.prisma"
  },
}
