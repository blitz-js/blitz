const path = require('path')
const fs = require('fs-extra')
const getPort = require('get-port')
const fetch = require('node-fetch')
const glob = require('../util/glob')
const gzipSize = require('gzip-size')
const logger = require('../util/logger')
const { spawn } = require('../util/exec')
const { parse: urlParse } = require('url')
const benchmarkUrl = require('./benchmark-url')
const { statsAppDir, diffingDir, benchTitle } = require('../constants')

module.exports = async function collectStats(
  runConfig = {},
  statsConfig = {},
  fromDiff = false
) {
  const stats = {
    [benchTitle]: {},
  }
  const orderedStats = {
    [benchTitle]: {},
  }
  const curDir = fromDiff ? diffingDir : statsAppDir

  const hasPagesToFetch =
    Array.isArray(runConfig.pagesToFetch) && runConfig.pagesToFetch.length > 0

  const hasPagesToBench =
    Array.isArray(runConfig.pagesToBench) && runConfig.pagesToBench.length > 0

  if (
    !fromDiff &&
    statsConfig.appStartCommand &&
    (hasPagesToFetch || hasPagesToBench)
  ) {
    const port = await getPort()
    const child = spawn(statsConfig.appStartCommand, {
      cwd: curDir,
      env: {
        PORT: port,
      },
      stdio: 'pipe',
    })
    let exitCode = null
    let logStderr = true
    child.stdout.on('data', (data) => process.stdout.write(data))
    child.stderr.on('data', (data) => logStderr && process.stderr.write(data))

    child.on('exit', (code) => {
      exitCode = code
    })
    // give app a second to start up
    await new Promise((resolve) => setTimeout(() => resolve(), 1500))

    if (exitCode !== null) {
      throw new Error(
        `Failed to run \`${statsConfig.appStartCommand}\` process exited with code ${exitCode}`
      )
    }

    if (hasPagesToFetch) {
      const fetchedPagesDir = path.join(curDir, 'fetched-pages')
      await fs.mkdirp(fetchedPagesDir)

      for (let url of runConfig.pagesToFetch) {
        url = url.replace('$PORT', port)
        const { pathname } = urlParse(url)
        try {
          const res = await fetch(url)
          if (!res.ok) {
            throw new Error(`Failed to fetch ${url} got status: ${res.status}`)
          }
          const responseText = (await res.text()).trim()

          let fileName = pathname === '/' ? '/index' : pathname
          if (fileName.endsWith('/'))
            fileName = fileName.substr(0, fileName.length - 1)
          logger(
            `Writing file to ${path.join(fetchedPagesDir, `${fileName}.html`)}`
          )

          await fs.writeFile(
            path.join(fetchedPagesDir, `${fileName}.html`),
            responseText,
            'utf8'
          )
        } catch (err) {
          logger.error(err)
        }
      }
    }

    if (hasPagesToBench) {
      // disable stderr so we don't clobber logs while benchmarking
      // any pages that create logs
      logStderr = false

      for (let url of runConfig.pagesToBench) {
        url = url.replace('$PORT', port)
        logger(`Benchmarking ${url}`)

        const results = await benchmarkUrl(url, runConfig.benchOptions)
        logger(`Finished benchmarking ${url}`)

        const { pathname: key } = urlParse(url)
        stats[benchTitle][`${key} failed reqs`] = results.failedRequests
        stats[benchTitle][`${key} total time (seconds)`] = results.totalTime

        stats[benchTitle][`${key} avg req/sec`] = results.avgReqPerSec
      }
    }
    child.kill()
  }

  for (const fileGroup of runConfig.filesToTrack) {
    const { name, globs } = fileGroup
    const groupStats = {}
    const curFiles = new Set()

    for (const pattern of globs) {
      const results = await glob(pattern, { cwd: curDir, nodir: true })
      results.forEach((result) => curFiles.add(result))
    }

    for (const file of curFiles) {
      const fileKey = path.basename(file)
      const absPath = path.join(curDir, file)
      try {
        const fileInfo = await fs.stat(absPath)
        groupStats[fileKey] = fileInfo.size
        groupStats[`${fileKey} gzip`] = await gzipSize.file(absPath)
      } catch (err) {
        logger.error('Failed to get file stats', err)
      }
    }
    stats[name] = groupStats
  }

  for (const fileGroup of runConfig.filesToTrack) {
    const { name } = fileGroup
    orderedStats[name] = stats[name]
  }

  if (stats[benchTitle]) {
    orderedStats[benchTitle] = stats[benchTitle]
  }
  return orderedStats
}
