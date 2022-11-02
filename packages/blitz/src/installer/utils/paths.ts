import * as fs from "fs-extra"
import * as path from "path"

function ext(jsx = false) {
  return fs.existsSync(path.resolve("tsconfig.json")) ? (jsx ? ".tsx" : ".ts") : ".js"
}

function getBlitzServerPath() {
  const appDir = fs.existsSync(path.resolve(`app/blitz-server${ext(false)}`))
  const srcDir = fs.existsSync(path.resolve(`src/blitz-server${ext(false)}`))

  if (appDir) {
    return `app/blitz-server${ext(false)}`
  } else if (srcDir) {
    return `src/blitz-server${ext(false)}`
  }
}

function getBlitzClientPath() {
  const appDir = fs.existsSync(path.resolve(`app/blitz-client${ext(false)}`))
  const srcDir = fs.existsSync(path.resolve(`src/blitz-client${ext(false)}`))

  if (appDir) {
    return `app/blitz-client${ext(false)}`
  } else if (srcDir) {
    return `src/blitz-client${ext(false)}`
  }
}

export const paths = {
  document() {
    return `pages/_document${ext(true)}`
  },
  app() {
    return `pages/_app${ext(true)}`
  },
  blitzServer() {
    return getBlitzServerPath()
  },
  blitzClient() {
    return getBlitzClientPath()
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
