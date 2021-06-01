import {ChildProcess} from "child_process"
import spawn from "cross-spawn"
import express from "express"
import {existsSync, readFileSync, unlinkSync, writeFileSync} from "fs"
import {writeFile} from "fs-extra"
import getPort from "get-port"
import http from "http"
// `next` here is the symlink in `test/node_modules/next` which points to the root directory.
// This is done so that requiring from `next` works.
// The reason we don't import the relative path `../../dist/<etc>` is that it would lead to inconsistent module singletons
// import server from "next/dist/server/next"
import _pkg from "next/package.json"
import fetch from "node-fetch"
import path from "path"
import qs from "querystring"
import treeKill from "tree-kill"

// export const nextServer = server
export const pkg = _pkg

// polyfill Object.fromEntries for the test/integration/relay-analytics tests
// on node 10, this can be removed after we no longer support node 10
if (!Object.fromEntries) {
  Object.fromEntries = require("core-js/features/object/from-entries")
}

export function initBlitzServerScript(
  scriptPath: string,
  successRegexp: RegExp,
  env: Record<any, any>,
  failRegexp: RegExp,
  opts?: {
    onStdout?: (stdout: string) => void
    onStderr?: (stderr: string) => void
  },
) {
  return new Promise((resolve, reject) => {
    const instance = spawn("node", ["--no-deprecation", scriptPath], {env})

    function handleStdout(data: Buffer) {
      const message = data.toString()
      if (successRegexp.test(message)) {
        resolve(instance)
      }
      process.stdout.write(message)

      if (opts && opts.onStdout) {
        opts.onStdout(message.toString())
      }
    }

    function handleStderr(data: Buffer) {
      const message = data.toString()
      if (failRegexp && failRegexp.test(message)) {
        instance.kill()
        return reject(new Error("received failRegexp"))
      }
      process.stderr.write(message)

      if (opts && opts.onStderr) {
        opts.onStderr(message.toString())
      }
    }

    instance.stdout.on("data", handleStdout)
    instance.stderr.on("data", handleStderr)

    instance.on("close", () => {
      instance.stdout.removeListener("data", handleStdout)
      instance.stderr.removeListener("data", handleStderr)
    })

    instance.on("error", (err) => {
      reject(err)
    })
  })
}

export function renderViaAPI(app: any, pathname: string, query: Record<any, any>) {
  const url = `${pathname}${query ? `?${qs.stringify(query)}` : ""}`
  return app.renderToHTML({url}, {}, pathname, query)
}

export async function renderViaHTTP(
  appPort: number,
  pathname: string,
  query?: Record<any, any>,
  opts?: Record<any, any>,
) {
  return fetchViaHTTP(appPort, pathname, query, opts).then((res) => res.text())
}

export function fetchViaHTTP(
  appPort: number,
  pathname: string,
  query?: Record<any, any>,
  opts?: Record<any, any>,
) {
  const url = `http://localhost:${appPort}${pathname}${query ? `?${qs.stringify(query)}` : ""}`
  return fetch(url, opts)
}

export function findPort() {
  return getPort()
}

interface RunBlitzCommandOptions {
  cwd?: string
  env?: Record<any, any>
  spawnOptions?: any
  instance?: any
  stderr?: boolean
  stdout?: boolean
  ignoreFail?: boolean
}

export function runBlitzCommand(argv: any[], options: RunBlitzCommandOptions = {}) {
  const blitzDir = path.dirname(require.resolve("blitz/package"))
  const blitzBin = path.join(blitzDir, "bin/blitz")
  const cwd = options.cwd || blitzDir
  // Let Next.js decide the environment
  const env = {
    ...process.env,
    ...options.env,
    NODE_ENV: "",
    __NEXT_TEST_MODE: "true",
  }

  return new Promise<any>((resolve, reject) => {
    console.log(`Running command "blitz ${argv.join(" ")}"`)
    const instance = spawn("node", ["--no-deprecation", blitzBin, ...argv], {
      ...options.spawnOptions,
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    })

    if (typeof options.instance === "function") {
      options.instance(instance)
    }

    let stderrOutput = ""
    if (options.stderr) {
      instance.stderr?.on("data", function (chunk) {
        stderrOutput += chunk
      })
    }

    let stdoutOutput = ""
    if (options.stdout) {
      instance.stdout?.on("data", function (chunk) {
        stdoutOutput += chunk
      })
    }

    instance.on("close", (code, signal) => {
      if (!options.stderr && !options.stdout && !options.ignoreFail && code !== 0) {
        console.log(stderrOutput)
        return reject(new Error(`command failed with code ${code}`))
      }

      resolve({
        code,
        signal,
        stdout: stdoutOutput,
        stderr: stderrOutput,
      })
    })

    instance.on("error", (err: any) => {
      console.log(stderrOutput)
      err.stdout = stdoutOutput
      err.stderr = stderrOutput
      reject(err)
    })
  })
}

interface RunBlitzLaunchOptions {
  cwd?: string
  env?: Record<any, any>
  onStdout?: (stdout: string) => void
  onStderr?: (stderr: string) => void
  stderr?: boolean
  stdout?: boolean
  blitzStart?: boolean
}

export function runBlitzLaunchCommand(
  argv: any[],
  stdOut: unknown,
  opts: RunBlitzLaunchOptions = {},
) {
  const blitzDir = path.dirname(require.resolve("blitz/package"))
  const blitzBin = path.join(blitzDir, "bin/blitz")
  const cwd = opts.cwd ?? path.dirname(require.resolve("blitz/package"))
  console.log(cwd)
  const env = {
    ...process.env,
    NODE_ENV: undefined,
    __NEXT_TEST_MODE: "true",
    ...opts.env,
  }

  return new Promise<void | string | ChildProcess>((resolve, reject) => {
    const instance = spawn(
      "node",
      ["--no-deprecation", blitzBin, opts.blitzStart ? "start" : "dev", ...argv],
      {cwd, env},
    )
    let didResolve = false

    function handleStdout(data: Buffer) {
      const message = data.toString()
      const bootupMarkers = {
        dev: /compiled successfully/i,
        start: /started server/i,
      }
      if (bootupMarkers[opts.blitzStart || stdOut ? "start" : "dev"].test(message)) {
        if (!didResolve) {
          didResolve = true
          resolve(stdOut ? message : instance)
        }
      }

      if (typeof opts.onStdout === "function") {
        opts.onStdout(message)
      }

      if (opts.stdout !== false) {
        process.stdout.write(message)
      }
    }

    function handleStderr(data: Buffer) {
      const message = data.toString()
      if (typeof opts.onStderr === "function") {
        opts.onStderr(message)
      }

      if (opts.stderr !== false) {
        process.stderr.write(message)
      }
    }

    instance.stdout.on("data", handleStdout)
    instance.stderr.on("data", handleStderr)

    instance.on("close", () => {
      instance.stdout.removeListener("data", handleStdout)
      instance.stderr.removeListener("data", handleStderr)
      if (!didResolve) {
        didResolve = true
        resolve()
      }
    })

    instance.on("error", (err) => {
      reject(err)
    })
  })
}

// Launch the app in dev mode.
export function launchApp(dir: string, port: number, opts: RunBlitzLaunchOptions = {}) {
  return runBlitzLaunchCommand(["-p", port], undefined, {cwd: dir, ...opts})
}

export function blitzBuild(dir: string, args = [], opts: RunBlitzCommandOptions = {}) {
  return runBlitzCommand(["build", ...args], {cwd: dir, ...opts})
}

export function blitzExport(dir: string, {outdir}, opts: RunBlitzCommandOptions = {}) {
  return runBlitzCommand(["export", "--outdir", outdir], {cwd: dir, ...opts})
}

export function blitzExportDefault(dir: string, opts: RunBlitzCommandOptions = {}) {
  return runBlitzCommand(["export"], {cwd: dir, ...opts})
}

export function blitzStart(dir: string, port: number, opts: RunBlitzLaunchOptions = {}) {
  return runBlitzLaunchCommand(["-p", port], undefined, {
    cwd: dir,
    ...opts,
    blitzStart: true,
  })
}

export function buildTS(args = [], cwd: string, env = {}) {
  cwd = cwd || path.dirname(require.resolve("@blitzjs/cli/package"))
  env = {...process.env, NODE_ENV: undefined, ...env}

  return new Promise<void>((resolve, reject) => {
    const instance = spawn(
      "node",
      ["--no-deprecation", require.resolve("typescript/lib/tsc"), ...args],
      {cwd, env},
    )
    let output = ""

    const handleData = (chunk) => {
      output += chunk.toString()
    }

    instance.stdout.on("data", handleData)
    instance.stderr.on("data", handleData)

    instance.on("exit", (code) => {
      if (code) {
        return reject(new Error("exited with code: " + code + "\n" + output))
      }
      resolve()
    })
  })
}

// Kill a launched app
export async function killApp(instance) {
  await new Promise<void>((resolve, reject) => {
    treeKill(instance.pid, (err) => {
      if (err) {
        if (
          process.platform === "win32" &&
          typeof err.message === "string" &&
          (err.message.includes(`no running instance of the task`) ||
            err.message.includes(`not found`))
        ) {
          // Windows throws an error if the process is already dead
          //
          // Command failed: taskkill /pid 6924 /T /F
          // ERROR: The process with PID 6924 (child process of PID 6736) could not be terminated.
          // Reason: There is no running instance of the task.
          return resolve()
        }
        return reject(err)
      }

      resolve()
    })
  })
}

export async function startApp(app: any) {
  await app.prepare()
  const handler = app.getRequestHandler()
  const server = http.createServer(handler)
  ;(server as any).__app = app

  await promiseCall(server, "listen")
  return server
}

export async function stopApp(server: any) {
  if (server.__app) {
    await server.__app.close()
  }
  await promiseCall(server, "close")
}

export function promiseCall(obj: any, method: any, ...args: any[]) {
  return new Promise((resolve, reject) => {
    const newArgs = [
      ...args,
      function (err: any, res: any) {
        if (err) return reject(err)
        resolve(res)
      },
    ]

    obj[method](...newArgs)
  })
}

export function waitFor(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

export async function startStaticServer(dir: string) {
  const app = express()
  const server = http.createServer(app)
  app.use(express.static(dir))

  await promiseCall(server, "listen")
  return server
}

export async function startCleanStaticServer(dir: string) {
  const app = express()
  const server = http.createServer(app)
  app.use(express.static(dir, {extensions: ["html"]}))

  await promiseCall(server, "listen")
  return server
}

// check for content in 1 second intervals timing out after
// 30 seconds
export async function check(contentFn: Function, regex: RegExp, hardError = true) {
  let content: any
  let lastErr: any

  for (let tries = 0; tries < 30; tries++) {
    try {
      content = await contentFn()
      if (typeof regex === "string") {
        if (regex === content) {
          return true
        }
      } else if (regex.test(content)) {
        // found the content
        return true
      }
      await waitFor(1000)
    } catch (err) {
      await waitFor(1000)
      lastErr = err
    }
  }
  console.error("TIMED OUT CHECK: ", {regex, content, lastErr})

  if (hardError) {
    throw new Error("TIMED OUT: " + regex + "\n\n" + content)
  }
  return false
}

export class File {
  path: string
  originalContent: any
  constructor(path: string) {
    this.path = path
    this.originalContent = existsSync(this.path) ? readFileSync(this.path, "utf8") : null
  }

  write(content: any) {
    if (!this.originalContent) {
      this.originalContent = content
    }
    writeFileSync(this.path, content, "utf8")
  }

  replace(pattern: any, newValue: any) {
    const currentContent = readFileSync(this.path, "utf8")
    if (pattern instanceof RegExp) {
      if (!pattern.test(currentContent)) {
        throw new Error(
          `Failed to replace content.\n\nPattern: ${pattern.toString()}\n\nContent: ${currentContent}`,
        )
      }
    } else if (typeof pattern === "string") {
      if (!currentContent.includes(pattern)) {
        throw new Error(
          `Failed to replace content.\n\nPattern: ${pattern}\n\nContent: ${currentContent}`,
        )
      }
    } else {
      throw new Error(`Unknown replacement attempt type: ${pattern}`)
    }

    const newContent = currentContent.replace(pattern, newValue)
    this.write(newContent)
  }

  delete() {
    unlinkSync(this.path)
  }

  restore() {
    this.write(this.originalContent)
  }
}

export async function evaluate(browser: any, input: any) {
  if (typeof input === "function") {
    const result = await browser.executeScript(input)
    await new Promise((resolve) => setTimeout(resolve, 30))
    return result
  } else {
    throw new Error(`You must pass a function to be evaluated in the browser.`)
  }
}

export async function retry(fn: Function, duration = 3000, interval = 500, description: string) {
  if (duration % interval !== 0) {
    throw new Error(
      `invalid duration ${duration} and interval ${interval} mix, duration must be evenly divisible by interval`,
    )
  }

  for (let i = duration; i >= 0; i -= interval) {
    try {
      return await fn()
    } catch (err) {
      if (i === 0) {
        console.error(`Failed to retry${description ? ` ${description}` : ""} within ${duration}ms`)
        throw err
      }
      console.warn(`Retrying${description ? ` ${description}` : ""} in ${interval}ms`)
      await waitFor(interval)
    }
  }
}

export async function hasRedbox(browser: any, expected = true) {
  let attempts = 30
  do {
    const has = await evaluate(browser, () => {
      return Boolean(
        [].slice
          .call(document.querySelectorAll("nextjs-portal"))
          .find((p: any) =>
            p.shadowRoot.querySelector(
              "#nextjs__container_errors_label, #nextjs__container_build_error_label",
            ),
          ),
      )
    })
    if (has) {
      return true
    }
    if (--attempts < 0) {
      break
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  } while (expected)
  return false
}

export async function getRedboxHeader(browser: any) {
  return retry(
    () =>
      evaluate(browser, () => {
        const portal = [].slice
          .call(document.querySelectorAll("nextjs-portal"))
          .find((p: any) => p.shadowRoot.querySelector("[data-nextjs-dialog-header"))
        const root = portal.shadowRoot
        return root
          .querySelector("[data-nextjs-dialog-header]")
          .innerText.replace(/__WEBPACK_DEFAULT_EXPORT__/, "Unknown")
      }),
    3000,
    500,
    "getRedboxHeader",
  )
}

export async function getRedboxSource(browser: any) {
  return retry(
    () =>
      evaluate(browser, () => {
        const portal = [].slice
          .call(document.querySelectorAll("nextjs-portal"))
          .find((p: any) =>
            p.shadowRoot.querySelector(
              "#nextjs__container_errors_label, #nextjs__container_build_error_label",
            ),
          )
        const root = portal.shadowRoot
        return root
          .querySelector("[data-nextjs-codeframe], [data-nextjs-terminal]")
          .innerText.replace(/__WEBPACK_DEFAULT_EXPORT__/, "Unknown")
      }),
    3000,
    500,
    "getRedboxSource",
  )
}

export function getBrowserBodyText(browser: any) {
  return browser.eval('document.getElementsByTagName("body")[0].innerText')
}

export function normalizeRegEx(src: string) {
  return new RegExp(src).source.replace(/\^\//g, "^\\/")
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path) as any)
}

export function getBuildManifest(dir: string) {
  return readJson(path.join(dir, ".next/build-manifest.json"))
}

export function getPageFileFromBuildManifest(dir: string, page: string) {
  const buildManifest = getBuildManifest(dir)
  const pageFiles = buildManifest.pages[page]
  if (!pageFiles) {
    throw new Error(`No files for page ${page}`)
  }

  const pageFile = pageFiles.find(
    (file: string) =>
      file.endsWith(".js") && file.includes(`pages${page === "" ? "/index" : page}`),
  )
  if (!pageFile) {
    throw new Error(`No page file for page ${page}`)
  }

  return pageFile
}

export function readBlitzBuildClientPageFile(appDir: string, page: string) {
  const pageFile = getPageFileFromBuildManifest(appDir, page)
  return readFileSync(path.join(appDir, ".next", pageFile), "utf8")
}

export function getPagesManifest(dir: string) {
  const serverFile = path.join(dir, ".next/server/pages-manifest.json")

  if (existsSync(serverFile)) {
    return readJson(serverFile)
  }
  return readJson(path.join(dir, ".next/serverless/pages-manifest.json"))
}

export function updatePagesManifest(dir: string, content: any) {
  const serverFile = path.join(dir, ".next/server/pages-manifest.json")

  if (existsSync(serverFile)) {
    return writeFile(serverFile, content)
  }
  return writeFile(path.join(dir, ".next/serverless/pages-manifest.json"), content)
}

export function getPageFileFromPagesManifest(dir: string, page: string) {
  const pagesManifest = getPagesManifest(dir)
  const pageFile = pagesManifest[page]
  if (!pageFile) {
    throw new Error(`No file for page ${page}`)
  }

  return pageFile
}

export function readBlitzBuildServerPageFile(appDir: string, page: string) {
  const pageFile = getPageFileFromPagesManifest(appDir, page)
  return readFileSync(path.join(appDir, ".next", "server", pageFile), "utf8")
}
