import {getProjectRoot} from "@blitzjs/config"
import {watch} from "chokidar"
import fs from "fs"
import os from "os"
import path from "path"
import * as REPL from "repl"
import {REPLCommand, REPLServer} from "repl"
// import {loadDependencies} from '../utils/load-dependencies'
import {getBlitzModulePaths, loadBlitz} from "./utils/load-blitz"
const debug = require("debug")("blitz:repl")

const projectRoot = getProjectRoot()

const loadBlitzModules = (repl: REPLServer, modules: any) => {
  Object.assign(repl.context, modules)
}

const loadModules = async (repl: REPLServer) => {
  // loadBlitzDependencies(repl)
  loadBlitzModules(repl, await loadBlitz())
}

const commands = {
  reload: {
    help: "Reload all modules",
    async action(this: REPLServer) {
      this.clearBufferedCommand()
      console.log("Reloading all modules...")
      await loadModules(this)
      this.displayPrompt()
    },
  },
}

const defineCommands = (repl: REPLServer, commands: Record<string, REPLCommand>) => {
  Object.entries(commands).forEach(([keyword, cmd]) => repl.defineCommand(keyword, cmd))
}

const setupSelfRolledHistory = (repl: any, path: string) => {
  function init() {
    try {
      const history = fs.readFileSync(path, {encoding: "utf8"})
      const nonEmptyLines = history.split(os.EOL).filter((line) => line.trim())
      repl.history.push(...nonEmptyLines.reverse())
    } catch (err) {
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

const initializeRepl = async (replOptions: REPL.ReplOptions) => {
  debug("initializeRepl")
  const modules = await loadBlitz()

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
    // watch('package.json').on('change', () => Console.loadDependencies(repl)),
    watch(await getBlitzModulePaths(), {
      ignoreInitial: true,
    }).on("all", () => loadModules(repl)),
  ]

  repl.on("reset", async () => {
    debug("Reset, so reloading modules...")
    await loadModules(repl)
  })
  repl.on("exit", () => watchers.forEach((watcher) => watcher.close()))
}

const runRepl = async (replOptions: REPL.ReplOptions) => {
  const repl = await initializeRepl(replOptions)
  repl.on("exit", () => process.exit())
  await setupFileWatchers(repl)
}

// const loadBlitzDependencies = (repl: REPLServer) => {
//   Object.assign(repl.context, loadDependencies(process.cwd()))
// }

export {runRepl}
