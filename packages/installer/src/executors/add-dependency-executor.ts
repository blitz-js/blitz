import {BaseExecutor, executorArgument, getExecutorArgument} from './executor'
import * as fs from 'fs-extra'
import * as path from 'path'
import spawn from 'cross-spawn'
import {log} from '@blitzjs/server/src/log'

interface NpmPackage {
  name: string
  // defaults to latest published
  version?: string
  // defaults to false
  isDevDep?: boolean
}

export interface AddDependencyExecutor extends BaseExecutor {
  packages: executorArgument<NpmPackage[]>
}

export function isAddDependencyExecutor(executor: BaseExecutor): executor is AddDependencyExecutor {
  return (executor as AddDependencyExecutor).packages !== undefined
}

async function getPackageManager(): Promise<'yarn' | 'npm'> {
  if (fs.existsSync(path.resolve('package-lock.json'))) {
    return 'npm'
  }
  return 'yarn'
}

export async function addDependencyExecutor(executor: AddDependencyExecutor, cliArgs: any): Promise<void> {
  const packageManager = await getPackageManager()
  const packagesToInstall = getExecutorArgument(executor.packages, cliArgs)
  for (const pkg of packagesToInstall) {
    const args: string[] = ['add']
    // if devDep flag isn't specified we install as a devDep
    if (pkg.isDevDep !== false) {
      args.push(packageManager === 'yarn' ? '-D' : '--save-dev')
    }
    pkg.version ? args.push(`${pkg.name}@${pkg.version}`) : args.push(pkg.name)
    log.meta(`Installing ${pkg.name} ${pkg.isDevDep !== false ? 'as a dev dependency' : ''}`)
    spawn.sync(packageManager, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
    })
  }
  log.progress(`${packagesToInstall.length} packages installed successfully`)
}
