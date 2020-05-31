import * as REPL from 'repl'
import path from 'path'
import fs from 'fs'
import {REPLCommand, REPLServer} from 'repl'
import {watch} from 'chokidar'
import pkgDir from 'pkg-dir'
import os from 'os'

// import {loadDependencies} from '../utils/load-dependencies'
import {getBlitzModulePaths, loadBlitz} from './utils/load-blitz'

const projectRoot = pkgDir.sync() || process.cwd()

const commands = {
  reload: {
    help: 'Reload all modules',
    action(this: REPLServer) {
      this.clearBufferedCommand()
      console.log('Reloading all modules...')
      loadModules(this)
      this.displayPrompt()
    },
  },
}

const runRepl = async (replOptions: REPL.ReplOptions) => {
  const repl = initializeRepl(replOptions)

  const watchers = [
    // watch('package.json').on('change', () => Console.loadDependencies(repl)),
    watch(getBlitzModulePaths()).on('all', () => loadBlitzModules(repl)),
  ]

  repl.on('reset', () => loadModules(repl)).on('exit', () => watchers.forEach((watcher) => watcher.close()))
}

const initializeRepl = (replOptions: REPL.ReplOptions) => {
  const repl = REPL.start(replOptions)

  defineCommands(repl, commands)
  loadModules(repl)
  setupHistory(repl)

  return repl
}

const defineCommands = (repl: REPLServer, commands: Record<string, REPLCommand>) => {
  Object.entries(commands).forEach(([keyword, cmd]) => repl.defineCommand(keyword, cmd))
}

const loadModules = (repl: REPLServer) => {
  // loadBlitzDependencies(repl)
  loadBlitzModules(repl)
}

const loadBlitzModules = (repl: REPLServer) => {
  Object.assign(repl.context, loadBlitz())
}

// const loadBlitzDependencies = (repl: REPLServer) => {
//   Object.assign(repl.context, loadDependencies(process.cwd()))
// }

const setupHistory = (repl: any) => {
  const blitzConsoleHistoryPath = path.join(projectRoot, '.blitz-console-history')
  if (repl.setupHistory) {
    repl.setupHistory(blitzConsoleHistoryPath, () => {})
  } else {
    setupSelfRolledHistory(repl, blitzConsoleHistoryPath)
  }
}

const setupSelfRolledHistory = (repl: any, path: string) => {
  function init() {
    try {
      const history = fs.readFileSync(path, {encoding: 'utf8'})
      const nonEmptyLines = history.split(os.EOL).filter((line) => line.trim())
      repl.history.push(...nonEmptyLines.reverse())
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  function onExit() {
    const addedHistory = repl.lines.join(os.EOL)
    fs.appendFileSync(path, addedHistory)
  }

  init()
  repl.on('exit', onExit)
}

export {runRepl}
