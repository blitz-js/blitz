import findUp from "find-up"
import findupSync from "findup-sync"
import resolveFrom from "resolve-from"
import {isInternalBlitzMonorepoDevelopment} from "./helpers"
import {join, dirname} from "path"

export async function findNodeModulesRoot(src = process.cwd()): Promise<string> {
  let root: string
  if (isInternalBlitzMonorepoDevelopment) {
    root = join(__dirname, "..", "..", "..", "..", "/node_modules")
  } else {
    const blitzPkgLocation = dirname(
      (await findUp("package.json", {
        cwd: resolveFrom(src, "blitz"),
      })) ?? "",
    )

    if (!blitzPkgLocation) {
      throw new Error("Internal Blitz Error: unable to find 'blitz' package location")
    }

    if (blitzPkgLocation.includes(".pnpm")) {
      root = join(blitzPkgLocation, "../../../../")
    } else {
      root = join(blitzPkgLocation, "../")
    }
  }

  return root
}

export function findNodeModulesRootSync(src = process.cwd()): string {
  const location = findupSync("package.json", {cwd: src})
  if (location) {
    return join(location, "..", "node_modules") + "/"
  } else {
    throw new Error("Blitz Internal Error: unable to find root package.json file location")
  }
}
