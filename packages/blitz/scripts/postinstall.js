const childProcess = require("cross-spawn")
const {promisify} = require("util")
const fs = require("fs")
const path = require("path")
const resolveFrom = require("resolve-from")

const copyFile = promisify(fs.copyFile)
const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

const debug = require("debug")("blitz:postinstall")

const isInBlitzMonorepo = fs.existsSync(path.join(__dirname, "../test"))
let isInstalledGlobally = isInBlitzMonorepo ? false : true // default

try {
  const maybeGlobalBlitzPath = resolveFrom(__dirname, "blitz")
  const localBlitzPath = resolveFrom.silent(process.cwd(), "blitz")
  isInstalledGlobally = maybeGlobalBlitzPath !== localBlitzPath
} catch (error) {
  // noop
}

const isUsingNpm =
  process.env.npm_config_user_agent && process.env.npm_config_user_agent.startsWith("npm")

/*
  Adapted from https://github.com/prisma/prisma/blob/974cbeff4a7f616137ce540d0ec88a2a86365892/src/packages/client/scripts/postinstall.js
*/
function codegen() {
  /**
   * Adds `package.json` to the end of a path if it doesn't already exist'
   * @param {string} pth
   */
  function addPackageJSON(pth) {
    if (pth.endsWith("package.json")) return pth
    return path.join(pth, "package.json")
  }

  /**
   * Looks up for a `package.json` which is not `@blitz/cli` or `blitz` and returns the directory of the package
   * @param {string} startPath - Path to Start At
   * @param {number} limit - Find Up limit
   * @returns {string | null}
   */
  function findPackageRoot(startPath, limit = 10) {
    if (!startPath || !fs.existsSync(startPath)) return null
    let currentPath = startPath
    // Limit traversal
    for (let i = 0; i < limit; i++) {
      const pkgPath = addPackageJSON(currentPath)
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = require(pkgPath)
          if (pkg.name && !["@blitz/cli", "blitz"].includes(pkg.name)) {
            return pkgPath.replace("package.json", "")
          }
        } catch {}
      }
      currentPath = path.join(currentPath, "../")
    }
    return null
  }

  async function main() {
    if (process.env.INIT_CWD) {
      process.chdir(process.env.INIT_CWD) // necessary, because npm chooses __dirname as process.cwd()
      // in the postinstall hook
    }
    await ensureEmptyDotBlitz()

    const localPath = getLocalPackagePath()
    // Only execute if !localpath
    const installedGlobally = localPath ? undefined : await isInstalledGlobally()

    // this is needed, so that the Generate command does not fail in postinstall
    process.env.BLITZ_GENERATE_IN_POSTINSTALL = "true"

    // this is needed, so we can find the correct schemas in yarn workspace projects
    const root = findPackageRoot(localPath)

    process.env.BLITZ_GENERATE_IN_POSTINSTALL = root ? root : "true"

    if (isUsingNpm && root && !fs.existsSync(path.join(root, "node_modules", "next"))) {
      // Sometimes with npm the next package is missing because of how
      // we use the `npm:@blitzjs/next` syntax to install the fork at node_modules/next
      debug("Missing next package, manually installing...")
      const corePkg = require("@blitzjs/core/package.json")
      await run("npm", ["install", "--no-save", `next@${corePkg.dependencies.next}`], root, [
        "ignore",
      ])
    }

    debug({
      localPath,
      installedGlobally,
      init_cwd: process.env.INIT_CWD,
      BLITZ_GENERATE_IN_POSTINSTALL: process.env.BLITZ_GENERATE_IN_POSTINSTALL,
    })
    try {
      if (localPath) {
        await run("node", [
          localPath,
          "codegen",
          "--postinstall",
          doubleQuote(getPostInstallTrigger()),
        ])
        return
      }
      if (installedGlobally) {
        await run("blitz", ["codegen", "--postinstall", doubleQuote(getPostInstallTrigger())])
        return
      }
    } catch (e) {
      // if exit code = 1 do not print
      if (e && e !== 1) {
        console.error(e)
      }
      debug(e)
    }

    if (!localPath && !installedGlobally) {
      console.error(
        `In order to use "@blitz/client", please install Blitz CLI. You can install it with "npm add -D blitz".`,
      )
    }
  }

  function getLocalPackagePath() {
    try {
      const packagePath = require.resolve("blitz/package.json")
      if (packagePath) {
        return require.resolve("blitz")
      }
    } catch (e) {
      //
    }

    try {
      const packagePath = require.resolve("@blitz/cli/package.json")
      if (packagePath) {
        return require.resolve("@blitz/cli")
      }
    } catch (e) {}

    return null
  }

  async function isInstalledGlobally() {
    try {
      await run("blitz", ["-v"], process.cwd(), ["ignore"])
      return true
    } catch (e) {
      return false
    }
  }

  if (!process.env.BLITZ_SKIP_POSTINSTALL_GENERATE) {
    main()
      .catch((e) => {
        console.error(e)
        process.exit(0)
      })
      .finally(() => {
        debug(`postinstall trigger: ${getPostInstallTrigger()}`)
      })
  }

  function run(cmd, params, cwd = process.cwd(), stdio = ["pipe", "inherit", "inherit"]) {
    const child = childProcess.spawn(cmd, params, {
      stdio,
      cwd,
    })

    return new Promise((resolve, reject) => {
      child.on("close", () => {
        resolve()
      })
      child.on("exit", (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(code)
        }
      })
      child.on("error", () => {
        reject()
      })
    })
  }

  async function ensureEmptyDotBlitz() {
    try {
      const dotBlitzDir = isInBlitzMonorepo
        ? path.join(process.cwd(), "node_modules/.blitz")
        : path.join(__dirname, "../../.blitz")

      await makeDir(dotBlitzDir)
      const defaultIndexJsPath = path.join(dotBlitzDir, "index.js")
      const defaultIndexBrowserJSPath = path.join(dotBlitzDir, "index-browser.js")
      const defaultIndexDTSPath = path.join(dotBlitzDir, "index.d.ts")

      if (!fs.existsSync(defaultIndexJsPath)) {
        await copyFile(path.join(__dirname, "default-index.js"), defaultIndexJsPath)
      }
      if (!fs.existsSync(defaultIndexBrowserJSPath)) {
        await copyFile(path.join(__dirname, "default-index-browser.js"), defaultIndexBrowserJSPath)
      }

      if (!fs.existsSync(defaultIndexDTSPath)) {
        await copyFile(path.join(__dirname, "default-index.d.ts"), defaultIndexDTSPath)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function makeDir(input) {
    const make = async (pth) => {
      try {
        await mkdir(pth)

        return pth
      } catch (error) {
        if (error.code === "EPERM") {
          throw error
        }

        if (error.code === "ENOENT") {
          if (path.dirname(pth) === pth) {
            throw new Error(`operation not permitted, mkdir '${pth}'`)
          }

          if (error.message.includes("null bytes")) {
            throw error
          }

          await make(path.dirname(pth))

          return make(pth)
        }

        try {
          const stats = await stat(pth)
          if (!stats.isDirectory()) {
            throw new Error("The path is not a directory")
          }
        } catch (_) {
          throw error
        }

        return pth
      }
    }

    return await make(path.resolve(input))
  }

  /**
   * Get the command that triggered this postinstall script being run. If there is
   * an error while attempting to get this value then the string constant
   * 'ERROR_WHILE_FINDING_POSTINSTALL_TRIGGER' is returned.
   * This information is just necessary for telemetry.
   * This get's passed in to Generate, which then automatically get's propagated to telemetry.
   */
  function getPostInstallTrigger() {
    /*
  npm_config_argv` is not officially documented so here are our (Prisma's) research notes
  `npm_config_argv` is available to the postinstall script when the containing package has been installed by npm into some project.
  An example of its value:
  ```
  npm_config_argv: '{"remain":["../test"],"cooked":["add","../test"],"original":["add","../test"]}',
  ```
  We are interesting in the data contained in the "original" field.
  Trivia/Note: `npm_config_argv` is not available when running e.g. `npm install` on the containing package itself (e.g. when working on it)
  Yarn mimics this data and environment variable. Here is an example following `yarn add` for the same package:
  ```
  npm_config_argv: '{"remain":[],"cooked":["add"],"original":["add","../test"]}'
  ```
  Other package managers like `pnpm` have not been tested.
  */

    const maybe_npm_config_argv_string = process.env.npm_config_argv

    if (maybe_npm_config_argv_string === undefined) {
      return UNABLE_TO_FIND_POSTINSTALL_TRIGGER__ENVAR_MISSING
    }

    let npm_config_argv
    try {
      npm_config_argv = JSON.parse(maybe_npm_config_argv_string)
    } catch (e) {
      return `${UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_PARSE_ERROR}: ${maybe_npm_config_argv_string}`
    }

    if (typeof npm_config_argv !== "object" || npm_config_argv === null) {
      return `${UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_SCHEMA_ERROR}: ${maybe_npm_config_argv_string}`
    }

    const npm_config_arv_original_arr = npm_config_argv.original

    if (!Array.isArray(npm_config_arv_original_arr)) {
      return `${UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_SCHEMA_ERROR}: ${maybe_npm_config_argv_string}`
    }

    const npm_config_arv_original = npm_config_arv_original_arr
      .filter((arg) => arg !== "")
      .join(" ")

    const command =
      npm_config_arv_original === ""
        ? getPackageManagerName()
        : [getPackageManagerName(), npm_config_arv_original].join(" ")

    return command
  }

  /**
   * Wrap double quotes around the given string.
   */
  function doubleQuote(x) {
    return `"${x}"`
  }

  /**
   * Get the package manager name currently being used. If parsing fails, then the following pattern is returned:
   * UNKNOWN_NPM_CONFIG_USER_AGENT(<string received>).
   */
  function getPackageManagerName() {
    const userAgent = process.env.npm_config_user_agent
    if (!userAgent) return "MISSING_NPM_CONFIG_USER_AGENT"

    const name = parsePackageManagerName(userAgent)
    if (!name) return `UNKNOWN_NPM_CONFIG_USER_AGENT(${userAgent})`

    return name
  }

  /**
   * Parse package manager name from useragent. If parsing fails, `null` is returned.
   */
  function parsePackageManagerName(userAgent) {
    let packageManager = null

    // example: 'yarn/1.22.4 npm/? node/v13.11.0 darwin x64'
    // References:
    // - https://pnpm.js.org/en/3.6/only-allow-pnpm
    // - https://github.com/cameronhunter/npm-config-user-agent-parser
    if (userAgent) {
      const matchResult = userAgent.match(/^([^/]+)\/.+/)
      if (matchResult) {
        packageManager = matchResult[1].trim()
      }
    }

    return packageManager
  }

  // prettier-ignore
  const UNABLE_TO_FIND_POSTINSTALL_TRIGGER__ENVAR_MISSING = 'UNABLE_TO_FIND_POSTINSTALL_TRIGGER__ENVAR_MISSING'
  // prettier-ignore
  const UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_PARSE_ERROR = 'UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_PARSE_ERROR'
  // prettier-ignore
  const UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_SCHEMA_ERROR = 'UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_SCHEMA_ERROR'
}

if (!isInstalledGlobally) {
  codegen()
}
