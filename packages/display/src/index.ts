import c from "chalk"
import ora from "ora"
import readline from "readline"
import {Logger} from "tslog"

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
  console.log(" ")
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
}

export const baseLogger = new Logger({
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
  prettyInspectHighlightStyles: {name: "black"},
  maskValuesOfKeys: ["password", "passwordConfirmation"],
  exposeErrorCodeFrame: process.env.NODE_ENV !== "production",
})
