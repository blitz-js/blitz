import semverSatisfies from 'semver/functions/satisfies'
import enquirer from 'enquirer'
import {log} from '@blitzjs/server'
import {installNext} from './install-next'

export function ensureCompatibleNext() {
  return {
    async or(onFailure: () => void) {
      const supportedVersion = '>=9.3' // TODO: Should this come from the `blitz` package peer dependency field?

      const [isUsableNext, currentVersion] = packageInRange('next', supportedVersion)

      if (isUsableNext) return true // All good lets bail

      log.warning(
        currentVersion
          ? `Blitz requires next(${supportedVersion}) as a peer dependency but next@${currentVersion} was detected.`
          : `Blitz requires next(${supportedVersion}) as a peer dependency but next was not found.`,
      )

      if (
        await confirmPrompt(
          `Would you like Blitz to ${currentVersion ? 'updgrade' : 'install'} it now for you?`,
        )
      ) {
        const ok = await didRun(installNext)
        if (!ok) onFailure()
      } else {
        onFailure()
      }
    },
  }
}

type Loader = (n: string) => any
const removeReleaseDescription = (version: string) => version.replace(/-.+$/, '')
function packageInRange(name: string, range: string, loader: Loader = require) {
  let pkg
  try {
    pkg = loader(name + '/package.json') as {version: string}
  } catch (err) {
    return [false, null]
  }
  return [semverSatisfies(removeReleaseDescription(pkg.version), range), pkg.version]
}

async function confirmPrompt(message: string): Promise<boolean> {
  return await new Promise((resolve, reject) => {
    // @ts-ignore
    enquirer.on('cancel', () => {
      resolve(false)
    })
    enquirer
      .prompt<{continue: string}>({
        name: 'continue',
        type: 'select',
        message: message,
        choices: ['Yes', 'No'],
      })
      .then((resp) => resp.continue === 'Yes')
      .then(resolve)
      .catch(reject)
  })
}

async function didRun(func: () => Promise<any>) {
  try {
    await func()
    return true
  } catch (err) {
    return false
  }
}
