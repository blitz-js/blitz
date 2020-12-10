import {getConfig} from "@blitzjs/config"
import c from "chalk"
import {Table} from "console-table-printer"
import ora from "ora"
import readline from "readline"
import {Logger} from "tslog"


type LogConfig = {
  level: "trace" | "debug" | "info" | "warn" | "error" | "fatal"
}

const defaultConfig: LogConfig = {
  level: "info",
}

const getLogConfig = (): LogConfig => {
  const config = getConfig()

  // TODO - validate log config and print helpfull error if invalid
  if (config.log && typeof config.log === "object") {
    return {...defaultConfig, ...config.log} as any
  }

  return defaultConfig
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

const withWarning = (str: string) => {
  return `⚠️  ${c.yellow(str)}`
}

const withCaret = (str: string) => {
  return `${c.gray(">")} ${str}`
}

const withCheck = (str: string) => {
  return `${c.green("✔")} ${str}`
}

const withX = (str: string) => {
  return `${c.red.bold("✕")} ${str}`
}

const withProgress = (str: string) => {
  return withCaret(c.bold(str))
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

/**
 * Logs a red error message to stderr.
 *
 * @param {string} msg
 */
const warning = (msg: string) => {
  console.log(withCaret(withWarning(msg)))
}

/**
 * Logs a red error message to stderr.
 *
 * @param {string} msg
 */
const error = (msg: string) => {
  console.error(withX(c.red.bold(msg)))
}

/**
 * Logs a subtle gray message to stdout.
 *
 * @param {string} msg
 */
const meta = (msg: string) => {
  console.log(withCaret(c.gray(msg)))
}

/**
 * Logs a progress message to stdout.
 *
 * @param {string} msg
 */
const progress = (msg: string) => {
  console.log(withCaret(c.bold(msg)))
}

const info = (msg: string) => {
  console.log(c.bold(msg))
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

const newline = () => {
  const logLevel = getLogConfig().level
  switch (logLevel) {
    case "trace":
    case "debug":
    case "info":
      console.log(" ")
      break
    case "warn":
    case "error":
    case "fatal":
      //nothing
      break
  }
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
const debug = (str: string) => {
  process.env.DEBUG && console.log(str)
}

declare module globalThis {
  let _blitz_baseLogger: Logger
}

export const baseLogger = () => {
  globalThis._blitz_baseLogger =
    globalThis._blitz_baseLogger ??
    new Logger({
      minLevel: getLogConfig().level,
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
    })

  return globalThis._blitz_baseLogger
}

export const log = {
  withBrand,
  withWarning,
  withCaret,
  withCheck,
  withX,
  withProgress,
  branded,
  clearLine,
  error,
  warning,
  meta,
  progress,
  spinner,
  success,
  newline,
  variable,
  info,
  debug,
  Table,
}
