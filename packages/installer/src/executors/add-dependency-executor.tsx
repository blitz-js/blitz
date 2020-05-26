import {ExecutorConfig, executorArgument, getExecutorArgument, Executor} from './executor'
import * as fs from 'fs-extra'
import * as path from 'path'
import {spawn} from 'cross-spawn'
import * as React from 'react'
import {Box, Text} from 'ink'
import {Newline} from '../components/newline'
import Spinner from 'ink-spinner'
import {useEnterToContinue} from '../utils/use-enter-to-continue'

interface NpmPackage {
  name: string
  // defaults to latest published
  version?: string
  // defaults to false
  isDevDep?: boolean
}

export interface Config extends ExecutorConfig {
  packages: executorArgument<NpmPackage[]>
}

export function isAddDependencyExecutor(executor: ExecutorConfig): executor is Config {
  return (executor as Config).packages !== undefined
}

export const type = 'add-dependency'

function Package({pkg, loading}: {pkg: NpmPackage; loading: boolean}) {
  return (
    <Text>
      {`   `}
      {loading ? <Spinner /> : '📦'}
      {` ${pkg.name}@${pkg.version}`}
    </Text>
  )
}

const DependencyList = ({
  lede,
  depsLoading = false,
  devDepsLoading = false,
  packages,
}: {
  lede: string
  depsLoading?: boolean
  devDepsLoading?: boolean
  packages: NpmPackage[]
}) => {
  return (
    <Box flexDirection="column">
      <Text>{lede}</Text>
      <Newline />
      <Text>Dependencies to be installed:</Text>
      {packages
        .filter((p) => !p.isDevDep)
        .map((pkg) => (
          <Package key={pkg.name} pkg={pkg} loading={depsLoading} />
        ))}
      <Newline />
      <Text>Dev Dependencies to be installed:</Text>
      {packages
        .filter((p) => p.isDevDep)
        .map((pkg) => (
          <Package key={pkg.name} pkg={pkg} loading={devDepsLoading} />
        ))}
    </Box>
  )
}

export const Propose: Executor['Propose'] = ({cliArgs, step, onProposalAccepted}) => {
  useEnterToContinue(onProposalAccepted)

  if (!isAddDependencyExecutor(step)) {
    onProposalAccepted()
    return null
  }
  return (
    <DependencyList
      lede={'Adding some shiny new dependencies.\nIf this list looks good, press ENTER to install.'}
      packages={getExecutorArgument(step.packages, cliArgs)}
    />
  )
}

async function getPackageManager(): Promise<'yarn' | 'npm'> {
  if (fs.existsSync(path.resolve('package-lock.json'))) {
    return 'npm'
  }
  return 'yarn'
}

async function installPackages(packages: NpmPackage[], isDev = false) {
  const packageManager = await getPackageManager()
  const args: string[] = ['add']

  if (isDev) {
    args.push(packageManager === 'yarn' ? '-D' : '--save-dev')
  }
  packages.forEach((pkg) => {
    pkg.version ? args.push(`${pkg.name}@${pkg.version}`) : args.push(pkg.name)
  })
  await new Promise((resolve) => {
    const cp = spawn(packageManager, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
    })
    cp.on('exit', resolve)
  })
}

export const Commit: Executor['Commit'] = ({cliArgs, step, onChangeCommitted}) => {
  const [depsInstalled, setDepsInstalled] = React.useState(false)
  const [devDepsInstalled, setDevDepsInstalled] = React.useState(false)

  useEnterToContinue(onChangeCommitted, depsInstalled && devDepsInstalled)

  React.useEffect(() => {
    async function installDeps() {
      const packagesToInstall = getExecutorArgument((step as Config).packages, cliArgs).filter(
        (p) => !p.isDevDep,
      )
      await installPackages(packagesToInstall)
      setDepsInstalled(true)
    }
    installDeps()
  }, [cliArgs, step])

  React.useEffect(() => {
    if (!depsInstalled) return
    async function installDevDeps() {
      const packagesToInstall = getExecutorArgument((step as Config).packages, cliArgs).filter(
        (p) => p.isDevDep,
      )
      await installPackages(packagesToInstall, true)
      setDevDepsInstalled(true)
    }
    installDevDeps()
  }, [cliArgs, depsInstalled, step])

  if (!isAddDependencyExecutor(step)) {
    onChangeCommitted()
    return null
  }
  return (
    <>
      <DependencyList
        lede={'Hang tight! Fetching the latest dependencies...'}
        depsLoading={!depsInstalled}
        devDepsLoading={!devDepsInstalled}
        packages={getExecutorArgument(step.packages, cliArgs)}
      />
      {depsInstalled && devDepsInstalled && (
        <Box paddingTop={1}>
          <Text>Dependencies installed! Press ENTER to continue</Text>
        </Box>
      )}
    </>
  )
}
