import * as fs from "fs-extra"
import * as path from "path"

function ext(jsx = false) {
  return fs.existsSync(path.resolve("tsconfig.json")) ? (jsx ? ".tsx" : ".ts") : ".js"
}

function getBlitzPath(type: string) {
  const appPath = `app/blitz-${type}${ext(false)}`
  const srcPath = `src/blitz-${type}${ext(false)}`
  const appDir = fs.existsSync(path.resolve(appPath))
  const srcDir = fs.existsSync(path.resolve(srcPath))

  if (appDir) {
    return appPath
  } else if (srcDir) {
    return srcPath
  }
}

function getAppSourceDir() {
  const appSrcPath = "src/app"
  const appSrcDir = fs.existsSync(path.resolve(appSrcPath))
  const srcPath = "src"
  const srcDir = fs.existsSync(path.resolve(srcPath))

  if (appSrcDir) {
    return "src"
  } else if (srcDir) {
    return "src/app"
  } else {
    return "app"
  }
}

function isUsingAppRouter() {
  // Check if using the NextJS app router
  // The root layout file is always present in the app directory
  const appRouterLayoutFile = `${getAppSourceDir()}/layout${ext(true)}`
  const appRouterLayoutFileExists = fs.existsSync(path.resolve(appRouterLayoutFile))

  if (appRouterLayoutFileExists) {
    return true
  } else {
    return false
  }
}

function findPageDir() {
  const srcPagePath = `src/pages`
  const srcPage = getAppSourceDir()

  switch (srcPage) {
    case "src": {
      return srcPagePath
    }
    default: {
      return `pages`
    }
  }
}

export const paths = {
  document() {
    return `${findPageDir()}/_document${ext(true)}`
  },
  app() {
    return isUsingAppRouter()
      ? `${getAppSourceDir()}/layout${ext(true)}`
      : `${findPageDir()}/_app${ext(true)}`
  },
  appSrcDirectory() {
    return getAppSourceDir()
  },
  blitzServer() {
    return getBlitzPath("server")
  },
  blitzClient() {
    return getBlitzPath("client")
  },
  entry() {
    return `${findPageDir()}/index${ext(true)}`
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
