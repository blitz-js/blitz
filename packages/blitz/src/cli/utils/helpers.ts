import {readdirSync} from "fs-extra"

export function getPkgManager() {
  return readdirSync(process.cwd()).includes("pnpm-lock.yaml")
    ? "pnpm"
    : readdirSync(process.cwd()).includes("yarn-lock.yaml")
    ? "yarn"
    : "npm"
}
