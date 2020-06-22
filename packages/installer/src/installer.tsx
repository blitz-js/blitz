import * as AddDependencyExecutor from "./executors/add-dependency-executor"
import * as NewFileExecutor from "./executors/new-file-executor"
import * as FileTransformExecutor from "./executors/file-transform-executor"
import {log} from "@blitzjs/display"
import {REGISTER_INSTANCE} from "ts-node"
import * as React from "react"
import {render} from "ink"
import {RecipeRenderer} from "./recipe-renderer"

export const setupTsNode = () => {
  if (!process[REGISTER_INSTANCE]) {
    // During blitz interal dev, oclif automaticaly sets up ts-node so we have to check
    require("ts-node").register({compilerOptions: {module: "commonjs"}})
  }
  require("tsconfig-paths/register")
}

type ExecutorConfig =
  | AddDependencyExecutor.Config
  | FileTransformExecutor.Config
  | NewFileExecutor.Config

export interface RecipeMeta {
  packageName: string
  packageDescription: string
  packageOwner: string
  packageRepoLink: string
  validateArgs?(args: {}): Promise<void>
  preInstall?(): Promise<void>
  postInstall?(): Promise<void>
}

export class Installer<Options extends RecipeMeta> {
  private readonly steps: ExecutorConfig[]
  private readonly options: Options

  constructor(options: Options, steps: ExecutorConfig[]) {
    this.options = options
    this.steps = steps
    setupTsNode()
  }

  // eslint-disable-next-line require-await
  private async validateArgs(cliArgs: {}): Promise<void> {
    if (this.options.validateArgs) return this.options.validateArgs(cliArgs)
  }
  // eslint-disable-next-line require-await
  private async preInstall(): Promise<void> {
    if (this.options.preInstall) return this.options.preInstall()
  }
  // eslint-disable-next-line require-await
  private async postInstall(): Promise<void> {
    if (this.options.postInstall) return this.options.postInstall()
  }

  async run(cliArgs: {}): Promise<void> {
    try {
      await this.validateArgs(cliArgs)
    } catch (err) {
      log.error(err)
      return
    }
    await this.preInstall()
    try {
      const {waitUntilExit} = render(
        <RecipeRenderer cliArgs={cliArgs} steps={this.steps} recipeMeta={this.options} />,
        {
          experimental: true,
        },
      )
      await waitUntilExit()
    } catch (e) {
      console.error(e)
    }
    await this.postInstall()

    log.info(
      `\n🎉 The recipe for ${this.options.packageName} completed successfully! Its functionality is now fully configured in your Blitz app.\n`,
    )
  }
}
