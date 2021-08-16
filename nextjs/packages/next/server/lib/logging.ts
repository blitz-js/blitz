import { Logger } from 'tslog'
import {
  loadConfigAtRuntime,
  LogLevel,
} from '../../next-server/server/config-shared'

// eslint-disable-next-line
declare module globalThis {
  let _blitz_baseLogger: Logger
  let _blitz_logLevel: LogLevel
}

export const newline = () => {
  globalThis._blitz_logLevel =
    globalThis._blitz_logLevel ?? loadConfigAtRuntime().log?.level

  const logLevel = globalThis._blitz_logLevel

  switch (logLevel) {
    case 'trace':
    case 'debug':
    case 'info':
      console.log(' ')
      break
    case 'warn':
    case 'error':
    case 'fatal':
    default:
      //nothing
      break
  }
}

export const baseLogger = (): Logger => {
  if (globalThis._blitz_baseLogger) return globalThis._blitz_baseLogger

  let config
  try {
    config = loadConfigAtRuntime()
  } catch {
    config = {}
  }

  globalThis._blitz_baseLogger = new Logger({
    minLevel: config.log?.level || 'info',
    dateTimePattern:
      process.env.NODE_ENV === 'production'
        ? 'year-month-day hour:minute:second.millisecond'
        : 'hour:minute:second.millisecond',
    displayFunctionName: false,
    displayFilePath: 'hidden',
    displayRequestId: false,
    dateTimeTimezone:
      process.env.NODE_ENV === 'production'
        ? 'utc'
        : Intl.DateTimeFormat().resolvedOptions().timeZone,
    prettyInspectHighlightStyles: {
      name: 'yellow',
      number: 'blue',
      bigint: 'blue',
      boolean: 'blue',
    },
    maskValuesOfKeys: ['password', 'passwordConfirmation'],
    exposeErrorCodeFrame: process.env.NODE_ENV !== 'production',
  })

  return globalThis._blitz_baseLogger
}
