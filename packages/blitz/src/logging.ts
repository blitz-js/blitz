import {ISettingsParam, Logger} from "tslog"
import c from "chalk"
import {Table} from "console-table-printer"
import ora from "ora"
import readline from "readline"

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal"

declare module globalThis {
  let _blitz_baseLogger: Logger
  let _blitz_logLevel: LogLevel
}

export const newLine = () => {
  const logLevel: LogLevel = globalThis._blitz_logLevel

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

export const baseLogger = (options?: ISettingsParam): Logger => {
  if (globalThis._blitz_baseLogger) return globalThis._blitz_baseLogger

  let config
  try {
    config = {} as any // todo: loadConfigAtRuntime()
  } catch {
    config = {}
  }

  globalThis._blitz_baseLogger = new Logger({
    minLevel: config?.log?.level || "info",
    type: config?.log?.type || "pretty",
    dateTimePattern:
      process.env.NODE_ENV === "production"
        ? "year-month-day hour:minute:second.millisecond"
        : "hour:minute:second.millisecond",
    displayFunctionName: false,
    displayFilePath: "hidden",
    displayRequestId: false,
    dateTimeTimezone:
      process.env.NODE_ENV === "production"
        ? "utc"
        : Intl.DateTimeFormat().resolvedOptions().timeZone,
    prettyInspectHighlightStyles: {
      name: "yellow",
      number: "blue",
      bigint: "blue",
      boolean: "blue",
    },
    maskValuesOfKeys: ["password", "passwordConfirmation"],
    exposeErrorCodeFrame: process.env.NODE_ENV !== "production",
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
