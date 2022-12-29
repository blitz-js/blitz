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

function getAppSourceDir(isConfigFile?: boolean) {
  const srcPath = "src/pages"
  const srcDir = fs.existsSync(path.resolve(srcPath))
  const appPath = "app/pages"
  const appDir = fs.existsSync(path.resolve(appPath))

  if (srcDir) {
    return "src"
  } else if (appDir && isConfigFile) {
    return "{pages,app}"
  } else if (appDir && !!isConfigFile) {
    return "app"
  }
}

export const paths = {
  document() {
    return `pages/_document${ext(true)}`
  },
  app() {
    return `pages/_app${ext(true)}`
  },
  appSrcDirectory({config}: {config?: boolean}) {
    return getAppSourceDir(config)
  },
  blitzServer() {
    return getBlitzPath("server")
  },
  blitzClient() {
    return getBlitzPath("client")
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
