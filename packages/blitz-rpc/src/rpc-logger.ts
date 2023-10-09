import {baseLogger, newLine, prettyMs} from "blitz"
import chalk, {type Chalk} from "chalk"
import type {RpcLoggerOptions} from "./server/plugin"

type Logger = ReturnType<typeof baseLogger>
type RpcLoggerState = {
  startTime: {
    [key: string]: number | undefined
  }
  duration: {
    resolver: number
    serializer: number
    total: number
  }
  verbosityInfo: boolean
  verbosityDebug: boolean
}

export function isBlitzRPCVerbose(
  resolverName: string,
  level: string,
  loggingOptions?: RpcLoggerOptions,
) {
  // blitz rpc is by default verbose - to keep current behavior
  if (!loggingOptions) {
    if (globalThis.blitzRpcRpcLoggerOptions) {
      loggingOptions = globalThis.blitzRpcRpcLoggerOptions
    } else {
      return true
    }
  }
  //if logging exists and verbose is not defined then default to true
  if (loggingOptions && !("verbose" in loggingOptions)) {
    loggingOptions.verbose = true
  }
  const isLevelDisabled = loggingOptions?.disablelevel === level
  if (loggingOptions?.verbose) {
    // If allowList array is defined then allow only those routes in allowList
    if (loggingOptions?.allowList) {
      if (loggingOptions?.allowList?.includes(resolverName) && !isLevelDisabled) {
        return true
      }
    }
    // If blockList array is defined then allow all routes except those in blockList
    if (loggingOptions?.blockList) {
      if (!loggingOptions?.blockList?.includes(resolverName) && !isLevelDisabled) {
        return true
      }
    }
    // if both allowList and blockList are not defined, then allow all routes
    if (!loggingOptions?.allowList && !loggingOptions?.blockList && !isLevelDisabled) {
      return true
    }
    return false
  }
  return false
}

export class RpcLogger {
  private logger: Logger
  private customChalk: Chalk
  private state: RpcLoggerState
  constructor(resolverName: string, loggingOptions?: RpcLoggerOptions) {
    const logger = baseLogger().getSubLogger({
      name: "blitz-rpc",
      prefix: [resolverName + "()"],
    })
    this.logger = logger
    this.customChalk = new chalk.Instance({
      level: logger.settings.type === "json" ? 0 : chalk.level,
    })
    const verbosityInfo = isBlitzRPCVerbose(resolverName, "info", loggingOptions)
    const verbosityDebug = isBlitzRPCVerbose(resolverName, "debug", loggingOptions)
    this.state = {
      startTime: {
        total: Date.now(),
      },
      duration: {
        resolver: 0,
        serializer: 0,
        total: 0,
      },
      verbosityInfo,
      verbosityDebug,
    }
  }
  public timer = {
    reset: () => {
      this.state.startTime = {}
      return this.timer
    },
    initResolver: () => {
      this.state.startTime["resolver"] = Date.now()
      return this.timer
    },
    resolverDuration: () => {
      if (!this.state.startTime["resolver"]) {
        throw new Error("resolverDuration called before initResolver")
      }
      this.state.duration.resolver = Date.now() - this.state.startTime["resolver"]
      return this.timer
    },
    initSerialization: () => {
      this.state.startTime["serializer"] = Date.now()
      return this.timer
    },
    initNextJsSerialization: () => {
      this.state.startTime["nextJsSerialization"] = Date.now()
      return this.timer
    },
    nextJsSerializationDuration: () => {
      if (!this.state.startTime["nextJsSerialization"]) {
        throw new Error("nextJsSerializationDuration called before initNextJsSerialization")
      }
      this.state.duration.serializer = Date.now() - this.state.startTime["nextJsSerialization"]
      return this.timer
    },
    serializerDuration: () => {
      if (!this.state.startTime["serializer"]) {
        throw new Error("serializerDuration called before initSerializer")
      }
      this.state.duration.serializer = Date.now() - this.state.startTime["serializer"]
      return this.timer
    },
    totalDuration: () => {
      if (!this.state.startTime["total"]) {
        throw new Error("totalDuration called before initResolver")
      }
      this.state.duration.total = Date.now() - this.state.startTime["total"]
      return this.timer
    },
  }
  public preResolver(data: any) {
    if (this.state.verbosityInfo) {
      this.logger.info(
        this.customChalk.dim("Starting with input:"),
        data ? data : JSON.stringify(data),
      )
    }
  }
  public postResolver(result: any) {
    if (this.state.verbosityDebug) {
      this.logger.debug(this.customChalk.dim("Result:"), result ? result : JSON.stringify(result))
    }
  }
  public nextJsSerialization() {
    if (this.state.verbosityDebug) {
      this.logger.debug(
        this.customChalk.dim(`Next.js serialization:${prettyMs(this.state.duration.serializer)}`),
      )
    }
  }
  public postResponse() {
    if (this.state.verbosityInfo) {
      this.logger.info(
        this.customChalk.dim(
          `Finished: resolver:${prettyMs(this.state.duration.resolver)} serializer:${prettyMs(
            this.state.duration.serializer,
          )} total:${prettyMs(this.state.duration.total)}`,
        ),
      )
    }
    newLine()
  }
  public error(e: any) {
    if (typeof e === "string") {
      this.logger.error(e)
    }
    this.logger.error(new Error(e))
    newLine()
  }
  public warn(e: string) {
    this.logger.warn(e)
    newLine()
  }
}
