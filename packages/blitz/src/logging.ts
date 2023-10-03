import {ILogObj, ISettingsParam, Logger} from "tslog"
import c from "chalk"
import {Table} from "console-table-printer"
import ora from "ora"
import readline from "readline"

export type BlitzLoggerSettings = ISettingsParam<ILogObj>
export type BlitzLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal"

declare namespace globalThis {
  let _blitz_baseLogger: Logger<ILogObj>
  let _blitz_logLevel: BlitzLogLevel
}

export const baseLogger = (options: BlitzLoggerSettings = {}): Logger<ILogObj> => {
  if (globalThis._blitz_baseLogger) return globalThis._blitz_baseLogger

  globalThis._blitz_baseLogger = BlitzLogger(options)

  return globalThis._blitz_baseLogger
}

export const BlitzLogger = (settings: BlitzLoggerSettings = {}) => {
  const baseLogger = new Logger({
    prettyLogTimeZone: process.env.NODE_ENV === "production" ? "UTC" : "local",
    maskValuesOfKeys: ["password", "passwordConfirmation", "currentPassword"],
    type: process.env.NODE_ENV === "production" ? "json" : "pretty",
    prettyLogTemplate:
      "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{name}}]\t",
    ...settings,
  })

  return baseLogger
}

export const initializeLogger = (logger: Logger<ILogObj>) => {
  globalThis._blitz_baseLogger = logger
}

export const table = Table
export const chalk = c

// const blitzTrueBrandColor = '6700AB'
const blitzBrightBrandColor = "8a3df0"

// Using bright brand color so it's better for dark terminals
const brandColor = blitzBrightBrandColor

export const newLine = () => {
  const logLevel: BlitzLogLevel = globalThis._blitz_logLevel

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
 * Logs a red error message to stdout.
 *
 * @param {string} msg
 */
const error = (msg: string) => {
  console.log(`${c.red(msg)}`)
}

/**
 * Colorizes a variable for display.
 *
 * @param {string} val
 */
const variable = (val: any) => {
  return c.cyan.bold(`${val}`)
}

const box = async (mes: string, title: string) => {
  const boxen = (await import("boxen")).default
  return boxen(mes, {
    padding: 1,
    margin: 1,
    textAlignment: "left",
    title,
  })
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
  chalk,
  box,
}
