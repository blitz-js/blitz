import {log} from "@blitzjs/display"
import {render} from "ink"
import React from "react"
import * as AddDependencyExecutor from "./executors/add-dependency-executor"
import * as FileTransformExecutor from "./executors/file-transform-executor"
import * as NewFileExecutor from "./executors/new-file-executor"
import {RecipeRenderer} from "./recipe-renderer"
import {RecipeMeta} from "./types"
// const debug = require('debug')("blitz:installer")

type ExecutorConfig =
  | AddDependencyExecutor.Config
  | FileTransformExecutor.Config
  | NewFileExecutor.Config

export type {ExecutorConfig as ExecutorConfigUnion}

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
        {exitOnCtrlC: false},
      )
      await waitUntilExit()
      log.info(`\n🎉 The ${this.options.name} recipe has been installed!\n`)
    } catch (e) {
      log.error(e)
      return
    }
  }
}
