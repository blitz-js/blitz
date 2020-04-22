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
 * Console logs a green success message
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
 * Console logs a progress message
 */
export const progress = (msg: string) => {
  console.log(withCaret(chalk.whiteBright(msg)))
}

/**
 * Console logs a subtle gray message
 */
export const meta = (msg: string) => {
  console.log(withCaret(chalk.gray(msg)))
}

/**
 * Console errors a red error message
 */
export const error = (msg: string) => {
  console.error(withX(chalk.red.bold(msg)))
}

/**
 * Sets the color of a variable for logging
 */
export const variable = (val: string) => {
  return chalk.cyan.bold(`${val}`)
}
