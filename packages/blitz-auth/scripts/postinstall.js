//@ts-check
const resolveFrom = require("resolve-from")
const fs = require("fs")
const path = require("path")
const findUp = require("find-up")
const isInBlitzMonorepo = fs.existsSync(path.join(__dirname, "../../blitz-next"))

async function findNodeModulesRoot(src) {
  let root
  if (isInBlitzMonorepo) {
    root = path.join(src, "node_modules")
  } else if (src.includes(".pnpm")) {
    const blitzPkgLocation = path.dirname(
      (await findUp("package.json", {
        cwd: resolveFrom(src, "blitz"),
      })) || "",
    )
    if (!blitzPkgLocation) {
      throw new Error("Internal Blitz Error: unable to find 'blitz' package location")
    }
    root = path.join(blitzPkgLocation, "../../../../")
  } else {
    const blitzPkgLocation = path.dirname(
      (await findUp("package.json", {
        cwd: resolveFrom(src, "blitz"),
      })) || "",
    )
    if (!blitzPkgLocation) {
      throw new Error("Internal Blitz Error: unable to find 'blitz' package location")
    }

    root = path.join(blitzPkgLocation, "../")
  }
  return path.join(root, ".blitz")
}

async function patchNextAuth() {
  try {
    console.log("1")
    const nodeModulesRoot = await findNodeModulesRoot(__dirname)
    console.log(nodeModulesRoot)
    const nextAuthPackageJson = require.resolve("next-auth", {
      paths: [nodeModulesRoot],
    })
    console.log(nextAuthPackageJson)
    const nextAuthPackageJsonContents = require(path.join(
      nextAuthPackageJson,
      "..",
      "package.json",
    ))
    nextAuthPackageJsonContents.exports = {
      ...nextAuthPackageJsonContents.exports,
      "./core/*": "./core/*.js",
    }
    console.log(nextAuthPackageJsonContents)
    fs.writeFileSync(nextAuthPackageJson, JSON.stringify(nextAuthPackageJsonContents, null, 2))
    console.log("Patched next-auth package.json exports")
  } catch (e) {
    console.log("Failed to patch next-auth package.json exports")
    console.log(e)
  }
}

patchNextAuth()
