import spawn from "cross-spawn"
import express from "express"
import {existsSync, readFileSync, createReadStream} from "fs"
import {writeFile} from "fs-extra"
import getPort from "get-port"
import http from "http"
import https from "https"
import server from "next/dist/server/next"
import _pkg from "next/package.json"
import fetch from "node-fetch"
import path from "path"
import qs from "querystring"
import treeKill from "tree-kill"
import {readJSONSync} from "fs-extra"
// import {packageDirectorySync} from "pkg-dir"
import pkgDir from "pkg-dir"
import resolveCwd from "resolve-cwd"
export const nextServer = server
export const pkg = _pkg

export function initNextServerScript(scriptPath, successRegexp, env, failRegexp, opts) {
  return new Promise((resolve, reject) => {
    const instance = spawn(
      "node",
      [...((opts && opts.nodeArgs) || []), "--no-deprecation", scriptPath],
      {
        env,
        cwd: opts && opts.cwd,
      },
    )

    function handleStdout(data) {
      const message = data.toString()
      if (successRegexp.test(message)) {
        resolve(instance)
      }
      process.stdout.write(message)

      if (opts && opts.onStdout) {
        opts.onStdout(message.toString())
      }
    }

    function handleStderr(data) {
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

    instance.stdout?.on("data", handleStdout)
    instance.stderr?.on("data", handleStderr)

    instance.on("close", () => {
      instance.stdout?.removeListener("data", handleStdout)
      instance.stderr?.removeListener("data", handleStderr)
    })

    instance.on("error", (err) => {
      reject(err)
    })
  })
}

export function getFullUrl(appPortOrUrl: string | number, url: string, hostname?: string) {
  let fullUrl =
    typeof appPortOrUrl === "string" && appPortOrUrl.startsWith("http")
      ? appPortOrUrl
      : `http://${hostname ? hostname : "localhost"}:${appPortOrUrl}${url}`

  if (typeof appPortOrUrl === "string" && url) {
    const parsedUrl = new URL(fullUrl)
    const parsedPathQuery = new URL(url, fullUrl)

    parsedUrl.search = parsedPathQuery.search
    parsedUrl.pathname = parsedPathQuery.pathname

    if (hostname && parsedUrl.hostname === "localhost") {
      parsedUrl.hostname = hostname
    }
    fullUrl = parsedUrl.toString()
  }
  return fullUrl
}

export function renderViaAPI(app, pathname, query) {
  const url = `${pathname}${query ? `?${qs.stringify(query)}` : ""}`
  return app.renderToHTML({url}, {}, pathname, query)
}

export function renderViaHTTP(appPort, pathname, query, opts) {
  return fetchViaHTTP(appPort, pathname, query, opts).then((res) => res.text())
}

export function fetchViaHTTP(appPort, pathname, query, opts) {
  const url = `${pathname}${
    typeof query === "string" ? query : query ? `?${qs.stringify(query)}` : ""
  }`
  return fetch(getFullUrl(appPort, url), {
    // in node.js v17 fetch favors IPv6 but Next.js is
    // listening on IPv4 by default so force IPv4 DNS resolving
    agent: (parsedUrl) => {
      if (parsedUrl.protocol === "https:") {
        return new https.Agent({family: 4})
      }
      if (parsedUrl.protocol === "http:") {
        return new http.Agent({family: 4})
      }
    },
    ...opts,
  })
}

export function findPort() {
  return getPort()
}

export function resolveBin(pkg: string, executable = pkg) {
  const packageDir = pkgDir.sync()!
  if (!packageDir) throw new Error(`Could not find package.json for '${pkg}'`)
  const bin = readJSONSync(path.join(packageDir, "package.json"))
  const binPath = typeof bin === "object" ? bin.dependencies[executable] : bin
  if (!binPath) throw new Error(`No bin '${executable}' in module '${pkg}'`)

  const fullPath = path.join(packageDir, `node_modules`, `${pkg}`)

  return fullPath
}
export function getCommandBin(
  command: string,
  rootFolder: string = process.cwd(),
  _usePatched: boolean = false,
) {
  const bin = resolveBin(command)
  return path.resolve(rootFolder, bin)
}

export function runBlitzCommand(argv, options: RunNextCommandOptions = {}) {
  const nextnextbin = getCommandBin("blitz", options.cwd)
  const blitzBin = path.join(nextnextbin, "dist/index.cjs")
  const cwd = options.cwd || process.cwd()
  // Let Next.js decide the environment
  const env = {
    ...process.env,
    NODE_ENV: "production" as const,
    __NEXT_TEST_MODE: "true",
    ...options.env,
  }

  return new Promise((resolve, reject) => {
    console.log(`Running command "blitz ${argv.join(" ")}"`)
    const instance = spawn("node", [blitzBin, ...argv], {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    })

    if (typeof options.instance === "function") {
      options.instance(instance)
    }

    let mergedStdio = ""

    let stderrOutput = ""
    if (options.stderr) {
      instance.stderr?.on("data", function (chunk) {
        mergedStdio += chunk
        stderrOutput += chunk

        if (options.stderr === "log") {
          console.log(chunk.toString())
        }
      })
    } else {
      instance.stderr?.on("data", function (chunk) {
        mergedStdio += chunk
      })
    }

    let stdoutOutput = ""
    if (options.stdout) {
      instance.stdout?.on("data", function (chunk) {
        mergedStdio += chunk
        stdoutOutput += chunk

        if (options.stdout === "log") {
          console.log(chunk.toString())
        }
      })
    } else {
      instance.stdout?.on("data", function (chunk) {
        mergedStdio += chunk
      })
    }

    instance.on("close", (code, signal) => {
      if (!options.stderr && !options.stdout && !options.ignoreFail && code !== 0) {
        return reject(new Error(`command failed with code ${code}\n${mergedStdio}`))
      }

      resolve({
        code,
        signal,
        stdout: stdoutOutput,
        stderr: stderrOutput,
      })
    })

    instance.on("error", (err: any) => {
      err.stdout = stdoutOutput
      err.stderr = stderrOutput
      reject(err)
    })
  })
}

export function runBlitzCommandDev(argv, stdOut, opts: RunNextCommandDevOptions = {}) {
  const nextnextbin = getCommandBin("blitz", opts.cwd)
  const blitzBin = path.join(nextnextbin, "dist/index.cjs")

  const cwd = opts.cwd
  const env = {
    ...process.env,
    NODE_ENV: undefined,
    __NEXT_TEST_MODE: "true",
    ...opts.env,
  }

  return new Promise<void>((resolve, reject) => {
    const instance = spawn("node", [blitzBin, ...argv], {
      cwd,
      env,
    } as {})
    let didResolve = false

    function handleStdout(data) {
      const message = data.toString()
      const bootupMarkers = {
        dev: /compiled .*successfully/i,
        start: /started server/i,
      }
      if (
        (opts.bootupMarker && opts.bootupMarker.test(message)) ||
        bootupMarkers[opts.nextStart || stdOut ? "start" : "dev"].test(message)
      ) {
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

    function handleStderr(data) {
      const message = data.toString()
      if (typeof opts.onStderr === "function") {
        opts.onStderr(message)
      }

      if (opts.stderr !== false) {
        process.stderr.write(message)
      }
    }

    instance.stdout?.on("data", handleStdout)
    instance.stderr?.on("data", handleStderr)

    instance.on("close", () => {
      instance.stdout?.removeListener("data", handleStdout)
      instance.stderr?.removeListener("data", handleStderr)
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

// Blitz Utils
export function blitzLaunchApp(port, opts: RunNextCommandDevOptions) {
  return runBlitzCommandDev(["dev", "-p", port], undefined, opts)
}

export function blitzBuild(args = [], opts = {}): any {
  return runBlitzCommand(["build", ...args], opts)
}

export function nextLint(args = [], opts = {}) {
  return runBlitzCommand(["lint", ...args], opts)
}

export function blitzStart(port, opts = {}) {
  return runBlitzCommandDev(["start", "-p", port], undefined, {
    ...opts,
    nextStart: true,
  })
}

//Next Utils

export function runNextCommand(argv, options: RunNextCommandOptions = {}) {
  const nextnextbin = getCommandBin("next", options.cwd)
  const nextBin = path.join(nextnextbin, "dist/bin/next")
  const cwd = options.cwd || process.cwd()
  // Let Next.js decide the environment
  const env = {
    ...process.env,
    NODE_ENV: "production" as const,
    __NEXT_TEST_MODE: "true",
    ...options.env,
  }

  return new Promise((resolve, reject) => {
    console.log(`Running command "next ${argv.join(" ")}"`)
    const instance = spawn("node", [nextBin, ...argv], {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    })

    if (typeof options.instance === "function") {
      options.instance(instance)
    }

    let mergedStdio = ""

    let stderrOutput = ""
    if (options.stderr) {
      instance.stderr?.on("data", function (chunk) {
        mergedStdio += chunk
        stderrOutput += chunk

        if (options.stderr === "log") {
          console.log(chunk.toString())
        }
      })
    } else {
      instance.stderr?.on("data", function (chunk) {
        mergedStdio += chunk
      })
    }

    let stdoutOutput = ""
    if (options.stdout) {
      instance.stdout?.on("data", function (chunk) {
        mergedStdio += chunk
        stdoutOutput += chunk

        if (options.stdout === "log") {
          console.log(chunk.toString())
        }
      })
    } else {
      instance.stdout?.on("data", function (chunk) {
        mergedStdio += chunk
      })
    }

    instance.on("close", (code, signal) => {
      if (!options.stderr && !options.stdout && !options.ignoreFail && code !== 0) {
        return reject(new Error(`command failed with code ${code}\n${mergedStdio}`))
      }

      resolve({
        code,
        signal,
        stdout: stdoutOutput,
        stderr: stderrOutput,
      })
    })

    instance.on("error", (err: any) => {
      err.stdout = stdoutOutput
      err.stderr = stderrOutput
      reject(err)
    })
  })
}

export function runNextCommandDev(argv, stdOut, opts: RunNextCommandDevOptions = {}) {
  const nextnextbin = getCommandBin("next", opts.cwd)
  const nextDir = path.resolve(require.resolve("next/package"))
  const nextBin = path.join(nextnextbin, "dist/bin/next")

  const cwd = opts.cwd || nextDir
  const env = {
    ...process.env,
    NODE_ENV: undefined,
    __NEXT_TEST_MODE: "true",
    ...opts.env,
  }

  const nodeArgs = opts.nodeArgs || []
  return new Promise<void>((resolve, reject) => {
    const instance = spawn("node", [...nodeArgs, "--no-deprecation", nextBin, ...argv], {
      cwd,
      env,
    } as {})
    let didResolve = false

    function handleStdout(data) {
      const message = data.toString()
      const bootupMarkers = {
        dev: /compiled .*successfully/i,
        start: /started server/i,
      }
      if (
        (opts.bootupMarker && opts.bootupMarker.test(message)) ||
        bootupMarkers[opts.nextStart || stdOut ? "start" : "dev"].test(message)
      ) {
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

    function handleStderr(data) {
      const message = data.toString()
      if (typeof opts.onStderr === "function") {
        opts.onStderr(message)
      }

      if (opts.stderr !== false) {
        process.stderr.write(message)
      }
    }

    instance.stdout?.on("data", handleStdout)
    instance.stderr?.on("data", handleStderr)

    instance.on("close", () => {
      instance.stdout?.removeListener("data", handleStdout)
      instance.stderr?.removeListener("data", handleStderr)
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

export function launchApp(dir, port, opts: RunNextCommandDevOptions) {
  return runNextCommandDev([dir, "-p", port], undefined, opts)
}

export function nextBuild(dir, args = [], opts = {}): any {
  return runNextCommand(["build", dir, ...args], opts)
}

export function nextExport(dir, {outdir}, opts = {}) {
  return runNextCommand(["export", dir, "--outdir", outdir], opts)
}

export function nextExportDefault(dir, opts = {}) {
  return runNextCommand(["export", dir], opts)
}

export function nextStart(dir, port, opts = {}) {
  return runNextCommandDev(["start", "-p", port, dir], undefined, {
    ...opts,
    nextStart: true,
  })
}

export function buildTS(args = [], cwd, env = {}) {
  cwd = cwd || path.dirname(require.resolve("next/package"))
  env = {...process.env, NODE_ENV: undefined, ...env}

  return new Promise<void>((resolve, reject) => {
    const instance = spawn(
      "node",
      ["--no-deprecation", require.resolve("typescript/lib/tsc"), ...args],
      {cwd, env} as {},
    )
    let output = ""

    const handleData = (chunk) => {
      output += chunk.toString()
    }

    instance.stdout?.on("data", handleData)
    instance.stderr?.on("data", handleData)

    instance.on("exit", (code) => {
      if (code) {
        return reject(new Error("exited with code: " + code + "\n" + output))
      }
      resolve()
    })
  })
}

export async function killProcess(pid) {
  await new Promise<void>((resolve, reject) => {
    treeKill(pid, (err) => {
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

// Kill a launched app
export async function killApp(instance) {
  if (instance) {
    await killProcess(instance.pid)
  }
}

export async function startApp(app) {
  // force require usage instead of dynamic import in jest
  // x-ref: https://github.com/nodejs/node/issues/35889
  process.env.__NEXT_TEST_MODE = "jest"

  // TODO: tests that use this should be migrated to use
  // the nextStart test function instead as it tests outside
  // of jest's context
  await app.prepare()
  const handler = app.getRequestHandler()
  const server: any = http.createServer(handler)
  server.__app = app

  await promiseCall(server, "listen")
  return server
}

export async function stopApp(server) {
  if (server.__app) {
    await server.__app.close()
  }
  await promiseCall(server, "close")
}

export function promiseCall(obj, method, ...args) {
  return new Promise((resolve, reject) => {
    const newArgs = [
      ...args,
      function (err, res) {
        if (err) return reject(err)
        resolve(res)
      },
    ]

    obj[method](...newArgs)
  })
}

export function waitFor(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

export async function startStaticServer(dir, notFoundFile, fixedPort) {
  const app = express()
  const server = http.createServer(app)
  app.use(express.static(dir))

  if (notFoundFile) {
    app.use((req, res) => {
      createReadStream(notFoundFile).pipe(res)
    })
  }

  await promiseCall(server, "listen", fixedPort)
  return server
}

export async function startCleanStaticServer(dir) {
  const app = express()
  const server = http.createServer(app)
  app.use(express.static(dir, {extensions: ["html"]}))

  await promiseCall(server, "listen")
  return server
}

// check for content in 1 second intervals timing out after
// 30 seconds
export async function check(contentFn, regex, hardError = true) {
  let content
  let lastErr

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

export async function evaluate(browser, input) {
  if (typeof input === "function") {
    const result = await browser.eval(input)
    await new Promise((resolve) => setTimeout(resolve, 30))
    return result
  } else {
    throw new Error(`You must pass a function to be evaluated in the browser.`)
  }
}

export async function retry(fn, duration = 3000, interval = 500, description) {
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

export async function hasRedbox(browser, expected = true) {
  for (let i = 0; i < 30; i++) {
    const result = await evaluate(browser, () => {
      return Boolean(
        [].slice
          .call(document.querySelectorAll("nextjs-portal"))
          .find((p) =>
            p.shadowRoot.querySelector(
              "#nextjs__container_errors_label, #nextjs__container_build_error_label",
            ),
          ),
      )
    })

    if (result === expected) {
      return result
    }
    await waitFor(1000)
  }
  return false
}

export async function getRedboxHeader(browser) {
  return retry(
    () =>
      evaluate(browser, () => {
        const portal = [].slice
          .call(document.querySelectorAll("nextjs-portal"))
          .find((p) => p.shadowRoot.querySelector("[data-nextjs-dialog-header"))
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

export async function getRedboxSource(browser) {
  return retry(
    () =>
      evaluate(browser, () => {
        const portal = [].slice
          .call(document.querySelectorAll("nextjs-portal"))
          .find((p) =>
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

export async function getRedboxDescription(browser) {
  return retry(
    () =>
      evaluate(browser, () => {
        const portal = [].slice
          .call(document.querySelectorAll("nextjs-portal"))
          .find((p) => p.shadowRoot.querySelector("[data-nextjs-dialog-header]"))
        const root = portal.shadowRoot
        return root
          .querySelector("#nextjs__container_errors_desc")
          .innerText.replace(/__WEBPACK_DEFAULT_EXPORT__/, "Unknown")
      }),
    3000,
    500,
    "getRedboxDescription",
  )
}

export function getBrowserBodyText(browser) {
  return browser.eval('document.getElementsByTagName("body")[0].innerText')
}

export function normalizeRegEx(src) {
  return new RegExp(src).source.replace(/\^\//g, "^\\/")
}

function readJson(path) {
  return JSON.parse(readFileSync(path).toString())
}

export function getBuildManifest(dir) {
  return readJson(path.join(dir, ".next/build-manifest.json"))
}

export function getPageFileFromBuildManifest(dir, page) {
  const buildManifest = getBuildManifest(dir)
  const pageFiles = buildManifest.pages[page]
  if (!pageFiles) {
    throw new Error(`No files for page ${page}`)
  }

  const pageFile = pageFiles.find(
    (file) => file.endsWith(".js") && file.includes(`pages${page === "" ? "/index" : page}`),
  )
  if (!pageFile) {
    throw new Error(`No page file for page ${page}`)
  }

  return pageFile
}

export function readNextBuildClientPageFile(appDir, page) {
  const pageFile = getPageFileFromBuildManifest(appDir, page)
  return readFileSync(path.join(appDir, ".next", pageFile), "utf8")
}

export function getPagesManifest(dir) {
  const serverFile = path.join(dir, ".next/server/pages-manifest.json")

  if (existsSync(serverFile)) {
    return readJson(serverFile)
  }
  return readJson(path.join(dir, ".next/serverless/pages-manifest.json"))
}

export function updatePagesManifest(dir, content) {
  const serverFile = path.join(dir, ".next/server/pages-manifest.json")

  if (existsSync(serverFile)) {
    return writeFile(serverFile, content)
  }
  return writeFile(path.join(dir, ".next/serverless/pages-manifest.json"), content)
}

export function getPageFileFromPagesManifest(dir, page) {
  const pagesManifest = getPagesManifest(dir)
  const pageFile = pagesManifest[page]
  if (!pageFile) {
    throw new Error(`No file for page ${page}`)
  }

  return pageFile
}

export function readNextBuildServerPageFile(appDir, page) {
  const pageFile = getPageFileFromPagesManifest(appDir, page)
  return readFileSync(path.join(appDir, ".next", "server", pageFile), "utf8")
}

/**
 *
 * @param {string} suiteName
 * @param {{env: 'prod' | 'dev', appDir: string}} context
 * @param {{beforeAll?: Function; afterAll?: Function; runTests: Function}} options
 */
function runSuite(suiteName, context, options) {
  const {appDir, env} = context
  describe(`${suiteName} ${env}`, () => {
    beforeAll(async () => {
      options.beforeAll?.(env)
      context.stderr = ""
      const onStderr = (msg) => {
        context.stderr += msg
      }
      context.stdout = ""
      const onStdout = (msg) => {
        context.stdout += msg
      }
      if (env === "prod") {
        context.appPort = await findPort()
        const {stdout, stderr, code} = await blitzBuild([], {
          stderr: true,
          stdout: true,
        })
        context.stdout = stdout
        context.stderr = stderr
        context.code = code
        context.server = await blitzStart(context.appPort, {
          onStderr,
          onStdout,
        })
      } else if (env === "dev") {
        context.appPort = await findPort()
        context.server = await blitzLaunchApp(context.appPort, {
          onStderr,
          onStdout,
        })
      }
    })
    afterAll(async () => {
      options.afterAll?.(env)
      if (context.server) {
        await killApp(context.server)
      }
    })
    options.runTests(context, env)
  })
}

/**
 *
 * @param {string} suiteName
 * @param {string} appDir
 * @param {{beforeAll?: Function; afterAll?: Function; runTests: Function}} options
 */
export function runDevSuite(suiteName, appDir, options) {
  return runSuite(suiteName, {appDir, env: "dev"}, options)
}

/**
 *
 * @param {string} suiteName
 * @param {string} appDir
 * @param {{beforeAll?: Function; afterAll?: Function; runTests: Function}} options
 */
export function runProdSuite(suiteName, appDir, options) {
  return runSuite(suiteName, {appDir, env: "prod"}, options)
}

interface RunNextCommandOptions {
  cwd?: string
  env?: Record<any, any>
  spawnOptions?: any
  instance?: any
  stderr?: string
  stdout?: string
  ignoreFail?: boolean
  nodeArgs?: []
}

interface RunNextCommandDevOptions {
  cwd?: string
  env?: Record<any, any>
  onStdout?: (stdout: string) => void
  onStderr?: (stderr: string) => void
  stderr?: string | boolean
  stdout?: string | boolean
  nodeArgs?: []
  bootupMarker?: any
  nextStart?: boolean
}
