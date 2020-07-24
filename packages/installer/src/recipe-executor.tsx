import * as AddDependencyExecutor from "./executors/add-dependency-executor"
import * as NewFileExecutor from "./executors/new-file-executor"
import * as FileTransformExecutor from "./executors/file-transform-executor"
import {log} from "@blitzjs/display"
import * as React from "react"
import {render} from "ink"
import {RecipeRenderer} from "./recipe-renderer"

type ExecutorConfig =
  | AddDependencyExecutor.Config
  | FileTransformExecutor.Config
  | NewFileExecutor.Config

export {ExecutorConfig as ExecutorConfigUnion}

export interface RecipeMeta {
  name: string
  description: string
  owner: string
  repoLink: string
}

export class RecipeExecutor<Options extends RecipeMeta> {
  private readonly steps: ExecutorConfig[]
  private readonly options: Options

  constructor(options: Options, steps: ExecutorConfig[]) {
    this.options = options
    this.steps = steps
  }

  async run(cliArgs: {}): Promise<void> {
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
      return
    }

    log.info(
      `\n🎉 The recipe for ${this.options.name} completed successfully! Its functionality is now fully configured in your Blitz app.\n`,
    )
  }
}
