import {ILogObj, ISettingsParam, Logger} from "tslog"
import c from "chalk"
import {Table} from "console-table-printer"
import ora from "ora"
import readline from "readline"
import {join} from "path"
import {defaultConfig} from "./default-config"

// eslint-disable-next-line
declare module globalThis {
  let _blitz_baseLogger: Logger<ILogObj>
  let _blitz_logLevel: LogLevel
}

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal"

export function normalizeConfig(phase: string, config: any) {
  if (typeof config === "function") {
    config = config(phase, {defaultConfig})

    if (typeof config.then === "function") {
      throw new Error(
        "> Promise returned in blitz config. https://nextjs.org/docs/messages/promise-in-next-config",
      )
    }
  }
  return config
}

export function loadConfigAtRuntime() {
  if (!process.env.BLITZ_APP_DIR) {
    throw new Error("Internal Blitz Error: process.env.BLITZ_APP_DIR is not set")
  }
  return loadConfigProduction(process.env.BLITZ_APP_DIR)
}

export function assignDefaultsBase(userConfig: {[key: string]: any}) {
  const config = Object.keys(userConfig).reduce<{[key: string]: any}>((currentConfig, key) => {
    const value = userConfig[key]

    if (value === undefined || value === null) {
      return currentConfig
    }

    // Copied from assignDefaults in server/config.ts
    if (!!value && value.constructor === Object) {
      currentConfig[key] = {
        ...defaultConfig[key],
        ...Object.keys(value).reduce<any>((c, k) => {
          const v = value[k]
          if (v !== undefined && v !== null) {
            c[k] = v
          }
          return c
        }, {}),
      }
    } else {
      currentConfig[key] = value
    }

    return currentConfig
  }, {})
  const result = {...defaultConfig, ...config}
  return result
}

export function loadConfigProduction(pagesDir: string) {
  let userConfigModule
  try {
    const path = join(pagesDir, "next.config.js")
    debug("Loading config from ", path)
    // eslint-disable-next-line no-eval -- block webpack from following this module path
    userConfigModule = eval("require")(path)
  } catch {
    debug("Did not find custom config file")
    // In case user does not have custom config
    userConfigModule = {}
  }
  let userConfig = normalizeConfig(
    "phase-production-server",
    userConfigModule.default || userConfigModule,
  )
  return assignDefaultsBase(userConfig) as any
}

export const newline = () => {
  globalThis._blitz_logLevel = globalThis._blitz_logLevel ?? loadConfigAtRuntime().log?.level

  const logLevel = globalThis._blitz_logLevel

  switch (logLevel) {
    case "trace":
    case "debug":
    case "info":
      console.log(" ")
      break
    case "warn":
    case "error":
    case "fatal":
    default:
      //nothing
      break
  }
}

export const baseLogger = (options?: ISettingsParam<ILogObj>): Logger<ILogObj> => {
  if (globalThis._blitz_baseLogger) return globalThis._blitz_baseLogger

  let config
  try {
    config = loadConfigAtRuntime()
  } catch {
    config = {}
  }

  globalThis._blitz_baseLogger = new Logger({
    minLevel: config.log?.level || 3,
    type: config.log?.type || "pretty",
    prettyLogTemplate:
      process.env.NODE_ENV === "production"
        ? "{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}"
        : "{{hh}}:{{MM}}:{{ss}}:{{ms}}",
    prettyLogTimeZone: process.env.NODE_ENV === "production" ? "UTC" : "local",
    maskValuesOfKeys: ["password", "passwordConfirmation", "currentPassword"],
    ...options,
  })

  return globalThis._blitz_baseLogger
}

export const table = Table
export const chalk = c

// const blitzTrueBrandColor = '6700AB'
const blitzBrightBrandColor = "8a3df0"

// Using bright brand color so it's better for dark terminals
const brandColor = blitzBrightBrandColor

const withBrand = (str: string) => {
  return c.hex(brandColor).bold(str)
}

const withCaret = (str: string) => {
  return `${c.gray(">")} ${str}`
}

const withCheck = (str: string) => {
  return `${c.green("✔")} ${str}`
}

const withProgress = (str: string) => {
  return withCaret(str)
}

const greenText = (str: string) => {
  return `${c.green(str)}`
}

/**
 * Logs a red error message to stdout.
 *
 * @param {string} msg
 */
const error = (msg: string) => {
  console.log(`${c.red(msg)}`)
}

/**
 * Logs a branded purple message to stdout.
 *
 * @param {string} msg
 */
const branded = (msg: string) => {
  console.log(c.hex(brandColor).bold(msg))
}

/**
 * Clears the line and optionally log a message to stdout.
 *
 * @param {string} msg
 */
const clearLine = (msg?: string) => {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  msg && process.stdout.write(msg)
}

const clearConsole = () => {
  if (process.platform === "win32") {
    process.stdout.write("\x1B[2J\x1B[0f")
  } else {
    process.stdout.write("\x1B[2J\x1B[3J\x1B[H")
  }
}

/**
 * Logs a progress message to stdout.
 *
 * @param {string} msg
 */
const progress = (msg: string) => {
  console.log(withProgress(msg))
}

const spinner = (str: string) => {
  return ora({
    text: str,
    color: "blue",
    spinner: {
      interval: 120,
      frames: ["◢", "◣", "◤", "◥"],
    },
  })
}

/**
 * Logs a green success message to stdout.
 *
 * @param {string} msg
 */
const success = (msg: string) => {
  console.log(withCheck(c.green(msg)))
}

/**
 * Colorizes a variable for display.
 *
 * @param {string} val
 */
const variable = (val: any) => {
  return c.cyan.bold(`${val}`)
}

/**
 * If the DEBUG env var is set this will write to the console
 * @param str msg
 */
const debug = require("debug")("blitz")

export const log = {
  withBrand,
  withCaret,
  branded,
  clearLine,
  clearConsole,
  progress,
  spinner,
  success,
  greenText,
  error,
  variable,
  debug,
  Table,
}
