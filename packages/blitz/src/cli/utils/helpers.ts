import {readdirSync, existsSync} from "fs-extra"
import {join} from "path"

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
