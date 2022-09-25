import {watch} from "chokidar"
import fs from "fs"
import os from "os"
import path from "path"
import * as REPL from "repl"
import {REPLCommand, REPLServer} from "repl"
const debug = require("debug")("blitz:repl")
import ProgressBar from "progress"
import {log} from "../../logging"

export function getProjectRootSync() {
  return path.dirname(getConfigSrcPath())
}

export function getConfigSrcPath() {
  const tsPath = path.resolve(path.join(process.cwd(), "next.config.ts"))
  if (fs.existsSync(tsPath)) {
    return tsPath
  } else {
    const jsPath = path.resolve(path.join(process.cwd(), "next.config.js"))
    return jsPath
  }
}

const projectRoot = getProjectRootSync()
const isTypeScript = fs.existsSync(path.join(projectRoot, "tsconfig.json"))

const invalidateCache = (module: string) => {
  delete require.cache[require.resolve(module)]
}

export const forceRequire = (modulePath: string) => {
  invalidateCache(modulePath)

  if (isTypeScript) {
    return require(modulePath)
  } else {
    const esmRequire = require("esm")(module)
    return esmRequire(modulePath)
  }
}

export async function getBlitzModulePaths() {
  const projectRoot = getProjectRootSync()
  const {globby} = await import("globby")
  const paths = await globby(
    [
      "app/**/{queries,mutations}/**/*.{js,ts,tsx}",
      "utils/*.{js,ts,tsx}",
      "jobs/**/*.{js,ts,tsx}",
      "integrations/**/*.{js,ts,tsx}",
      "!**/*.test.*",
      "!**/*.spec.*",
    ],
    {cwd: projectRoot, gitignore: true},
  )
  paths.push("db")
  debug("Paths", paths)

  return [...paths.map((p: string) => path.join(projectRoot, p))]
}

export const loadBlitz = async (skipPreload: boolean) => {
  let paths = await getBlitzModulePaths()

  if (skipPreload) {
    // remove all paths except db
    paths = paths.filter((p) => p.includes("db"))
  }

  const percentage = new ProgressBar("Loading Modules :current/:total", {
    total: paths.length,
  })

  const modules: Record<string, any>[] = Object.assign(
    {},
    ...paths.map((modulePath) => {
      let name = path.parse(modulePath).name
      if (name === "index") {
        const dirs = path.dirname(modulePath).split(path.sep)
        name = dirs[dirs.length - 1] as string
      }

      try {
        debug("Loading", modulePath)
        const module = forceRequire(modulePath)
        const contextObj = module.default || module
        // debug("ContextObj", contextObj)

        percentage.tick()

        //TODO: include all exports here, not just default
        return {
          [name]: contextObj,
        }
      } catch (error) {
        log.error(`Failed to load ${modulePath}: ${error}`)
        debug("Failed to load module", error)
        return {}
      }
    }),
  )

  percentage.terminate()

  return modules
}

const loadBlitzModules = (repl: REPLServer, modules: any) => {
  Object.assign(repl.context, modules)
}

const loadModules = async (repl: REPLServer, skipPreload: boolean) => {
  loadBlitzModules(repl, await loadBlitz(skipPreload))
}

const commands = {
  reload: {
    help: "Reload all modules",
    async action(this: REPLServer) {
      this.clearBufferedCommand()
      console.log("Reloading all modules...")
      await loadModules(this, false)
      this.displayPrompt()
    },
  },
}

const defineCommands = (
  repl: REPLServer,
  // eslint-disable-next-line no-shadow
  commands: Record<string, REPLCommand>,
) => {
  Object.entries(commands).forEach(([keyword, cmd]) => repl.defineCommand(keyword, cmd))
}

// eslint-disable-next-line no-shadow
const setupSelfRolledHistory = (repl: any, path: string) => {
  function init() {
    try {
      const history = fs.readFileSync(path, {encoding: "utf8"})
      const nonEmptyLines = history.split(os.EOL).filter((line) => line.trim())
      repl.history.push(...nonEmptyLines.reverse())
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err
      }
    }
  }

  function onExit() {
    const addedHistory = repl.lines.join(os.EOL)
    fs.appendFileSync(path, addedHistory)
  }

  init()
  repl.on("exit", onExit)
}

const setupHistory = (repl: any) => {
  const blitzConsoleHistoryPath = path.join(projectRoot, ".blitz-console-history")
  if (repl.setupHistory) {
    repl.setupHistory(blitzConsoleHistoryPath, () => {})
  } else {
    setupSelfRolledHistory(repl, blitzConsoleHistoryPath)
  }
}

const initializeRepl = async (replOptions: REPL.ReplOptions, skipPreload: boolean) => {
  debug("initializeRepl")
  const modules = await loadBlitz(skipPreload)

  debug("Starting REPL...")
  const repl = REPL.start(replOptions)

  loadBlitzModules(repl, modules)
  defineCommands(repl, commands)
  setupHistory(repl)

  return repl
}

const setupFileWatchers = async (repl: REPLServer) => {
  debug("Setting up file watchers...")
  const watchers = [
    watch(await getBlitzModulePaths(), {
      ignoreInitial: true,
    }).on("all", () => loadModules(repl, false)),
  ]

  repl.on("reset", async () => {
    debug("Reset, so reloading modules...")
    await loadModules(repl, false)
  })
  repl.on("exit", () => watchers.forEach((watcher) => watcher.close()))
}

const runRepl = async (replOptions: REPL.ReplOptions, skipPreload: boolean) => {
  const repl = await initializeRepl(replOptions, skipPreload)
  repl.on("exit", () => process.exit())
  await setupFileWatchers(repl)
}

export {runRepl}
