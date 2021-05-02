#!/usr/bin/env node
import { existsSync } from 'fs'
import arg from 'next/dist/compiled/arg/index.js'
import { resolve } from 'path'
import * as Log from '../build/output/log'
import { cliCommand } from '../bin/next'
import build from '../build'
import { printAndExit } from '../server/lib/utils'

const nextBuild: cliCommand = (argv) => {
  const validArgs: arg.Spec = {
    // Types
    '--help': Boolean,
    '--profile': Boolean,
    '--debug': Boolean,
    // Aliases
    '-h': '--help',
    '-d': '--debug',
  }

  let args: arg.Result<arg.Spec>
  try {
    args = arg(validArgs, { argv })
  } catch (error) {
    if (error.code === 'ARG_UNKNOWN_OPTION') {
      return printAndExit(error.message, 1)
    }
    throw error
  }
  if (args['--help']) {
    printAndExit(
      `
      Description
        Compiles the application for production deployment

      Usage
        $ next build <dir>

      <dir> represents the directory of the Next.js application.
      If no directory is provided, the current directory will be used.

      Options
      --profile     Can be used to enable React Production Profiling
    `,
      0
    )
  }
  if (args['--profile']) {
    Log.warn('Profiling is enabled. Note: This may affect performance')
  }
  const dir = resolve(args._[0] || '.')

  // Check if the provided directory exists
  if (!existsSync(dir)) {
    printAndExit(`> No such directory exists as the project root: ${dir}`)
  }

  async function preflight() {
    const { getPackageVersion } = await import('../lib/get-package-version')
    const semver = await import('next/dist/compiled/semver').then(
      (res) => res.default
    )

    const reactVersion: string | null = await getPackageVersion({
      cwd: dir,
      name: 'react',
    })
    if (
      reactVersion &&
      semver.lt(reactVersion, '17.0.1') &&
      semver.coerce(reactVersion)?.version !== '0.0.0'
    ) {
      Log.warn(
        'React 17.0.1 or newer will be required to leverage all of the upcoming features in Next.js 11.' +
          ' Read more: https://nextjs.org/docs/messages/react-version'
      )
    } else {
      const reactDomVersion: string | null = await getPackageVersion({
        cwd: dir,
        name: 'react-dom',
      })
      if (
        reactDomVersion &&
        semver.lt(reactDomVersion, '17.0.1') &&
        semver.coerce(reactDomVersion)?.version !== '0.0.0'
      ) {
        Log.warn(
          'React 17.0.1 or newer will be required to leverage all of the upcoming features in Next.js 11.' +
            ' Read more: https://nextjs.org/docs/messages/react-version'
        )
      }
    }
  }

  return preflight()
    .then(() => build(dir, null, args['--profile'], args['--debug']))
    .catch((err) => {
      console.error('')
      console.error('> Build error occurred')
      printAndExit(err)
    })
}

export { nextBuild }
