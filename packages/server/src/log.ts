import chalk from 'chalk'
import readline from 'readline'

export const withCaret = (str: string) => {
  return `${chalk.gray('>')} ${str}`
}

export const withCheck = (str: string) => {
  return `${chalk.green('✔')} ${str}`
}

export const withX = (str: string) => {
  return `${chalk.red.bold('✕')} ${str}`
}

/**
 * Logs a green success message to stdout.
 *
 * @param {string} msg
 */
export const success = (msg: string) => {
  console.log(withCheck(chalk.green(msg)))
}

/**
 * Clears the line and optionally writes a message
 * @param msg optional message to write
 */
export const clearLine = (msg?: string) => {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  msg && process.stdout.write(msg)
}

/**
 * Logs a progress message to stdout.
 *
 * @param {string} msg
 */
export const progress = (msg: string) => {
  console.log(withCaret(chalk.whiteBright(msg)))
}

/**
 * Logs a subtle gray message to stdout.
 *
 * @param {string} msg
 */
export const meta = (msg: string) => {
  console.log(withCaret(chalk.gray(msg)))
}

/**
 * Logs a red error message to stderr.
 *
 * @param {string} msg
 */
export const error = (msg: string) => {
  console.error(withX(chalk.red.bold(msg)))
}

/**
 * Colorizes a variable for display.
 *
 * @param {string} val
 */
export const variable = (val: string) => chalk.cyan.bold(`${val}`)
