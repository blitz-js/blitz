import {readdirSync, existsSync} from "fs-extra"
import {sync} from "cross-spawn"
import {join} from "path"

export function getGlobalPkgManager() {
  let pkgManager = "npm"

  try {
    const spawnPnpm = sync("pnpm", ["--version"], {
      stdio: "ignore",
    })
    if (!spawnPnpm.error && pkgManager === "npm") {
      pkgManager = "pnpm"
    }
  } catch (err) {
    console.log(err)
  }

  try {
    const spawnYarn = sync("yarn", ["--version"], {
      stdio: "ignore",
    })
    if (!spawnYarn.error && pkgManager === "npm") {
      pkgManager = "yarn"
    }
  } catch (err) {
    console.log(err)
  }

  return pkgManager
}

export function getPkgManager() {
  return readdirSync(process.cwd()).includes("pnpm-lock.yaml")
    ? "pnpm"
    : readdirSync(process.cwd()).includes("yarn-lock.yaml")
    ? "yarn"
    : "npm"
}

export const isInternalBlitzMonorepoDevelopment =
  existsSync(join(process.cwd(), "..", "..", "packages", "blitz", "dist", "chunks")) &&
  existsSync(join(process.cwd(), "..", "..", "packages", "blitz-next", "dist", "chunks"))
