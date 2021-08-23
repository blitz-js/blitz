import { promises as fs } from 'fs'
import chalk from 'chalk'
import path from 'path'

import findUp from 'next/dist/compiled/find-up'
import semver from 'next/dist/compiled/semver'
import * as CommentJson from 'next/dist/compiled/comment-json'

import { LintResult, formatResults } from './customFormatter'
import { writeDefaultConfig } from './writeDefaultConfig'
import { hasEslintConfiguration } from './hasEslintConfiguration'

import { ESLINT_PROMPT_VALUES } from '../constants'
import { existsSync } from '../find-pages-dir'
import { installDependencies } from '../install-dependencies'
import { hasNecessaryDependencies } from '../has-necessary-dependencies'
import { isYarn } from '../is-yarn'

import * as Log from '../../build/output/log'
import { EventLintCheckCompleted } from '../../telemetry/events/build'

type Config = {
  plugins: string[]
  rules: { [key: string]: Array<number | string> }
}

const requiredPackages = [
  { file: 'eslint/lib/api.js', pkg: 'eslint' },
  { file: 'eslint-config-next', pkg: 'eslint-config-next' },
]

async function cliPrompt() {
  console.log(
    chalk.bold(
      `${chalk.cyan(
        '?'
      )} How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint`
    )
  )

  try {
    const cliSelect = (await import('next/dist/compiled/cli-select')).default
    const { value } = await cliSelect({
      values: ESLINT_PROMPT_VALUES,
      valueRenderer: (
        {
          title,
          recommended,
        }: { title: string; recommended?: boolean; config: any },
        selected: boolean
      ) => {
        const name = selected ? chalk.bold.underline.cyan(title) : title
        return name + (recommended ? chalk.bold.yellow(' (recommended)') : '')
      },
      selected: chalk.cyan('❯ '),
      unselected: '  ',
    })

    return { config: value?.config }
  } catch {
    return { config: null }
  }
}

async function lint(
  baseDir: string,
  lintDirs: string[],
  eslintrcFile: string | null,
  pkgJsonPath: string | null,
  lintDuringBuild: boolean = false,
  eslintOptions: any = null,
  reportErrorsOnly: boolean = false,
  maxWarnings: number = -1,
  formatter: string | null = null
): Promise<
  | string
  | null
  | {
      output: string | null
      isError: boolean
      eventInfo: EventLintCheckCompleted
    }
> {
  try {
    // Load ESLint after we're sure it exists:
    const deps = await hasNecessaryDependencies(baseDir, requiredPackages)

    if (deps.missing.some((dep) => dep.pkg === 'eslint')) {
      Log.error(
        `ESLint must be installed${
          lintDuringBuild ? ' in order to run during builds:' : ':'
        } ${chalk.bold.cyan(
          isYarn(baseDir)
            ? 'yarn add --dev eslint'
            : 'npm install --save-dev eslint'
        )}`
      )
      return null
    }

    const mod = await import(deps.resolved.get('eslint')!)

    const { ESLint } = mod
    let eslintVersion = ESLint?.version ?? mod?.CLIEngine?.version

    if (!eslintVersion || semver.lt(eslintVersion, '7.0.0')) {
      return `${chalk.red(
        'error'
      )} - Your project has an older version of ESLint installed${
        eslintVersion ? ' (' + eslintVersion + ')' : ''
      }. Please upgrade to ESLint version 7 or later`
    }

    let options: any = {
      useEslintrc: true,
      baseConfig: {},
      errorOnUnmatchedPattern: false,
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      ...eslintOptions,
    }

    let eslint = new ESLint(options)

    let nextEslintPluginIsEnabled = false
    const pagesDirRules = ['@next/next/no-html-link-for-pages']

    for (const configFile of [eslintrcFile, pkgJsonPath]) {
      if (!configFile) continue

      const completeConfig: Config = await eslint.calculateConfigForFile(
        configFile
      )

      if (completeConfig.plugins?.includes('@next/next')) {
        nextEslintPluginIsEnabled = true
        break
      }
    }

    const pagesDir = baseDir

    if (nextEslintPluginIsEnabled) {
      let updatedPagesDir = false

      for (const rule of pagesDirRules) {
        if (
          !options.baseConfig!.rules?.[rule] &&
          !options.baseConfig!.rules?.[
            rule.replace('@next/next', '@next/babel-plugin-next')
          ]
        ) {
          if (!options.baseConfig!.rules) {
            options.baseConfig!.rules = {}
          }
          options.baseConfig!.rules[rule] = [1, pagesDir]
          updatedPagesDir = true
        }
      }

      if (updatedPagesDir) {
        eslint = new ESLint(options)
      }
    } else {
      Log.warn(
        'The Next.js plugin was not detected in your ESLint configuration. See https://nextjs.org/docs/basic-features/eslint#migrating-existing-config'
      )
    }

    const lintStart = process.hrtime()

    let results = await eslint.lintFiles(lintDirs)
    let selectedFormatter = null

    if (options.fix) await ESLint.outputFixes(results)
    if (reportErrorsOnly) results = await ESLint.getErrorResults(results) // Only return errors if --quiet flag is used

    if (formatter) selectedFormatter = await eslint.loadFormatter(formatter)
    const formattedResult = formatResults(
      baseDir,
      results,
      selectedFormatter?.format
    )
    const lintEnd = process.hrtime(lintStart)
    const totalWarnings = results.reduce(
      (sum: number, file: LintResult) => sum + file.warningCount,
      0
    )

    return {
      output: formattedResult.output,
      isError:
        ESLint.getErrorResults(results)?.length > 0 ||
        (maxWarnings >= 0 && totalWarnings > maxWarnings),
      eventInfo: {
        durationInSeconds: lintEnd[0],
        eslintVersion: eslintVersion,
        lintedFilesCount: results.length,
        lintFix: !!options.fix,
        nextEslintPluginVersion: nextEslintPluginIsEnabled
          ? require(path.join(
              path.dirname(deps.resolved.get('eslint-config-next')!),
              'package.json'
            )).version
          : null,
        nextEslintPluginErrorsCount: formattedResult.totalNextPluginErrorCount,
        nextEslintPluginWarningsCount:
          formattedResult.totalNextPluginWarningCount,
      },
    }
  } catch (err) {
    if (lintDuringBuild) {
      Log.error(
        `ESLint: ${err.message ? err.message.replace(/\n/g, ' ') : err}`
      )
      return null
    } else {
      throw new Error(err)
    }
  }
}

export async function runLintCheck(
  baseDir: string,
  lintDirs: string[],
  lintDuringBuild: boolean = false,
  eslintOptions: any = null,
  reportErrorsOnly: boolean = false,
  maxWarnings: number = -1,
  formatter: string | null = null,
  strict: boolean = false
): ReturnType<typeof lint> {
  try {
    // Find user's .eslintrc file
    const eslintrcFile =
      (await findUp(
        [
          '.eslintrc.js',
          '.eslintrc.yaml',
          '.eslintrc.yml',
          '.eslintrc.json',
          '.eslintrc',
        ],
        {
          cwd: baseDir,
        }
      )) ?? null

    const pkgJsonPath = (await findUp('package.json', { cwd: baseDir })) ?? null
    let packageJsonConfig = null
    if (pkgJsonPath) {
      const pkgJsonContent = await fs.readFile(pkgJsonPath, {
        encoding: 'utf8',
      })
      packageJsonConfig = CommentJson.parse(pkgJsonContent)
    }

    const config = await hasEslintConfiguration(eslintrcFile, packageJsonConfig)
    let deps

    if (config.exists) {
      // Run if ESLint config exists
      return await lint(
        baseDir,
        lintDirs,
        eslintrcFile,
        pkgJsonPath,
        lintDuringBuild,
        eslintOptions,
        reportErrorsOnly,
        maxWarnings,
        formatter
      )
    } else {
      // Display warning if no ESLint configuration is present during "next build"
      if (lintDuringBuild) {
        Log.warn(
          `No ESLint configuration detected. Run ${chalk.bold.cyan(
            'next lint'
          )} to begin setup`
        )
        return null
      } else {
        // Ask user what config they would like to start with for first time "next lint" setup
        const { config: selectedConfig } = strict
          ? ESLINT_PROMPT_VALUES.find(
              (opt: { title: string }) => opt.title === 'Strict'
            )!
          : await cliPrompt()

        if (selectedConfig == null) {
          // Show a warning if no option is selected in prompt
          Log.warn(
            'If you set up ESLint yourself, we recommend adding the Next.js ESLint plugin. See https://nextjs.org/docs/basic-features/eslint#migrating-existing-config'
          )
          return null
        } else {
          // Check if necessary deps installed, and install any that are missing
          deps = await hasNecessaryDependencies(baseDir, requiredPackages)
          if (deps.missing.length > 0)
            await installDependencies(baseDir, deps.missing, true)

          // Write default ESLint config.
          // Check for /pages and src/pages is to make sure this happens in Next.js folder
          if (
            existsSync(path.join(baseDir, 'pages')) ||
            existsSync(path.join(baseDir, 'src/pages'))
          ) {
            await writeDefaultConfig(
              baseDir,
              config,
              selectedConfig,
              eslintrcFile,
              pkgJsonPath,
              packageJsonConfig
            )
          }
        }

        Log.ready(
          `ESLint has successfully been configured. Run ${chalk.bold.cyan(
            'next lint'
          )} again to view warnings and errors.`
        )

        return null
      }
    }
  } catch (err) {
    throw err
  }
}
