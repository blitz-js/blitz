import {
  AddDependencyExecutor,
  isAddDependencyExecutor,
  addDependencyExecutor,
} from './executors/add-dependency-executor'
import {NewFileExecutor, isNewFileExecutor, newFileExecutor} from './executors/new-file-executor'
import {
  FileTransformExecutor,
  isFileTransformExecutor,
  fileTransformExecutor,
} from './executors/file-transform-executor'
import {log} from '@blitzjs/server/src/log'
import {logExecutorFrontmatter} from './executors/executor'
import {waitForConfirmation} from './utils/wait-for-confirmation'

type Executor = FileTransformExecutor | AddDependencyExecutor | NewFileExecutor

interface InstallerOptions {
  packageName: string
  packageDescription: string
  packageOwner: string
  packageRepoLink: string
  validateArgs?(args: {}): Promise<void>
  preInstall?(): Promise<void>
  beforeEach?(stepId: string | number): Promise<void>
  afterEach?(stepId: string | number): Promise<void>
  postInstall?(): Promise<void>
}

export class Installer<Options extends InstallerOptions> {
  private readonly steps: Executor[]
  private readonly options: Options

  constructor(options: Options, steps: Executor[]) {
    this.options = options
    this.steps = steps
  }

  private async validateArgs(cliArgs: {}): Promise<void> {
    if (this.options.validateArgs) return this.options.validateArgs(cliArgs)
  }
  private async preInstall(): Promise<void> {
    if (this.options.preInstall) return this.options.preInstall()
  }
  private async beforeEach(stepId: string | number): Promise<void> {
    if (this.options.beforeEach) return this.options.beforeEach(stepId)
  }
  private async afterEach(stepId: string | number): Promise<void> {
    if (this.options.afterEach) return this.options.afterEach(stepId)
  }
  private async postInstall(): Promise<void> {
    if (this.options.postInstall) return this.options.postInstall()
  }

  async displayFrontmatter() {
    log.branded(`Welcome to the installer for ${this.options.packageName}`)
    log.branded(this.options.packageDescription)
    log.info(`This package is authored and supported by ${this.options.packageOwner}`)
    log.info(`For additional documentation and support please visit ${this.options.packageRepoLink}`)
    console.log()
    await waitForConfirmation('Press enter to begin installation')
  }

  async run(cliArgs: {}): Promise<void> {
    await this.displayFrontmatter()
    try {
      await this.validateArgs(cliArgs)
    } catch (err) {
      log.error(err)
      return
    }
    await this.preInstall()
    for (const step of this.steps) {
      console.log() // newline

      await this.beforeEach(step.stepId)

      logExecutorFrontmatter(step)

      // using if instead of a switch allows us to strongly type the executors
      if (isFileTransformExecutor(step)) {
        await fileTransformExecutor(step, cliArgs)
      } else if (isAddDependencyExecutor(step)) {
        await addDependencyExecutor(step, cliArgs)
      } else if (isNewFileExecutor(step)) {
        await newFileExecutor(step, cliArgs)
      }

      await this.afterEach(step.stepId)
    }
    await this.postInstall()

    console.log()
    log.success(`Installer complete, ${this.options.packageName} is now be configured for your app!`)
  }
}
