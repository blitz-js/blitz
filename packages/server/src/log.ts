import chalk from 'chalk'

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
