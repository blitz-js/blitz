import chalk from 'chalk'
import ora from 'ora'
import readline from 'readline'

// const blitzTrueBrandColor = '6700AB'
const blitzBrightBrandColor = '8a3df0'

// Using brigh brand color so it's better for dark terminals
const brandColor = blitzBrightBrandColor

const withBrand = (str: string) => {
  return chalk.hex(brandColor).bold(str)
}

const withWarning = (str: string) => {
  return `⚠️  ${chalk.yellow(str)}`
}

const withPointing = (str: string) => {
  return `${chalk.yellow('👉')} ${str}`
}

const withCaret = (str: string) => {
  return `${chalk.gray('>')} ${str}`
}

const withCheck = (str: string) => {
  return `${chalk.green('✔')} ${str}`
}

const withX = (str: string) => {
  return `${chalk.red.bold('✕')} ${str}`
}

/**
 * Logs a branded purple message to stdout.
 *
 * @param {string} msg
 */
const branded = (msg: string) => {
  console.log(chalk.hex(brandColor).bold(msg))
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
  console.error(withX(chalk.red.bold(msg)))
}

/**
 * Logs a subtle gray message to stdout.
 *
 * @param {string} msg
 */
const meta = (msg: string) => {
  console.log(withCaret(chalk.gray(msg)))
}

/**
 * Logs a progress message to stdout.
 *
 * @param {string} msg
 */
const progress = (msg: string) => {
  console.log(withCaret(chalk.bold(msg)))
}

const spinner = (str: string) => {
  return ora({
    text: str,
    color: 'blue',
    spinner: {
      interval: 120,
      frames: ['◢', '◣', '◤', '◥'],
    },
  })
}

/**
 * Logs a green success message to stdout.
 *
 * @param {string} msg
 */
const success = (msg: string) => {
  console.log(withCheck(chalk.green(msg)))
}

/**
 * Colorizes a variable for display.
 *
 * @param {string} val
 */
const variable = (val: any) => {
  return chalk.cyan.bold(`${val}`)
}

export const log = {
  withBrand,
  withWarning,
  withCaret,
  withCheck,
  withX,
  branded,
  clearLine,
  error,
  warning,
  meta,
  progress,
  spinner,
  success,
  variable,
  withPointing,

}
