exports.__esModule = true
exports.hasNecessaryDependencies = hasNecessaryDependencies

var _chalk = _interopRequireDefault(require('chalk'))

var _path = require('path')

var _fileExists = require('./file-exists')

var _oxfordCommaList = require('./oxford-comma-list')

var _fatalError = require('./fatal-error')

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

const requiredTSPackages = [
  {
    file: 'typescript',
    pkg: 'typescript',
  },
  {
    file: '@types/react/index.d.ts',
    pkg: '@types/react',
  },
  {
    file: '@types/node/index.d.ts',
    pkg: '@types/node',
  },
]
const requiredLintPackages = [
  {
    file: 'eslint/lib/api.js',
    pkg: 'eslint',
  },
  {
    file: 'eslint-config-next',
    pkg: 'eslint-config-next',
  },
]

async function hasNecessaryDependencies(
  baseDir,
  checkTSDeps,
  checkESLintDeps,
  lintDuringBuild = false
) {
  if (!checkTSDeps && !checkESLintDeps) {
    return {
      resolved: undefined,
    }
  }

  let resolutions = new Map()
  let requiredPackages = checkESLintDeps
    ? requiredLintPackages
    : requiredTSPackages
  const missingPackages = requiredPackages.filter((p) => {
    try {
      resolutions.set(
        p.pkg,
        require.resolve(p.file, {
          paths: [baseDir],
        })
      )
      return false
    } catch (_) {
      return true
    }
  })

  if (missingPackages.length < 1) {
    return {
      resolved: resolutions,
    }
  }

  const packagesHuman = (0, _oxfordCommaList.getOxfordCommaList)(
    missingPackages.map((p) => p.pkg)
  )
  const packagesCli = missingPackages.map((p) => p.pkg).join(' ')
  const yarnLockFile = (0, _path.join)(baseDir, 'yarn.lock')
  const isYarn = await (0, _fileExists.fileExists)(yarnLockFile).catch(
    () => false
  )

  const removalTSMsg =
    '\n\n' +
    _chalk.default.bold(
      'If you are not trying to use TypeScript, please remove the ' +
        _chalk.default.cyan('tsconfig.json') +
        ' file from your package root (and any TypeScript files in your pages directory).'
    )

  const removalLintMsg =
    `\n\n` +
    (lintDuringBuild
      ? `If you do not want to run ESLint during builds, disable it in blitz.config.js. See https://blitzjs.com/docs/eslint-config#during-builds`
      : `Once installed, run ${_chalk.default.bold.cyan('next lint')} again.`)
  const removalMsg = checkTSDeps ? removalTSMsg : removalLintMsg
  throw new _fatalError.FatalError(
    _chalk.default.bold.red(
      checkTSDeps
        ? `It looks like you're trying to use TypeScript but do not have the required package(s) installed.`
        : `To use ESLint, additional required package(s) must be installed.`
    ) +
      '\n\n' +
      _chalk.default.bold(
        `Please install ${_chalk.default.bold(packagesHuman)} by running:`
      ) +
      '\n\n' +
      `\t${_chalk.default.bold.cyan(
        (isYarn ? 'yarn add --dev' : 'npm install --save-dev') +
          ' ' +
          packagesCli
      )}` +
      removalMsg +
      '\n'
  )
}
//# sourceMappingURL=has-necessary-dependencies.js.map
