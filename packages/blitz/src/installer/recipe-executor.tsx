import {render} from "ink"
import {baseLogger} from "../logging"
import React from "react"
import * as AddDependencyExecutor from "./executors/add-dependency-executor"
import * as FileTransformExecutor from "./executors/file-transform-executor"
import * as NewFileExecutor from "./executors/new-file-executor"
import * as PrintMessageExecutor from "./executors/print-message-executor"
import {RecipeRenderer} from "./recipe-renderer"
import {RecipeCLIArgs, RecipeCLIFlags, RecipeMeta} from "./types"
// const debug = require('debug')("blitz:installer")

type ExecutorConfig =
  | AddDependencyExecutor.Config
  | FileTransformExecutor.Config
  | NewFileExecutor.Config
  | PrintMessageExecutor.Config

export type {ExecutorConfig as ExecutorConfigUnion}

export class RecipeExecutor<Options extends RecipeMeta> {
  private readonly steps: ExecutorConfig[]
  private readonly options: Options

  constructor(options: Options, steps: ExecutorConfig[]) {
    this.options = options
    this.steps = steps
  }

  async run(
    cliArgs: RecipeCLIArgs = {},
    cliFlags: RecipeCLIFlags = {yesToAll: false},
  ): Promise<void> {
    try {
      const {waitUntilExit} = render(
        <RecipeRenderer
          cliArgs={cliArgs}
          cliFlags={cliFlags}
          steps={this.steps}
          recipeMeta={this.options}
        />,
        {exitOnCtrlC: false},
      )
      await waitUntilExit()
      baseLogger({displayDateTime: false, displayLogLevel: false}).info(
        `\n🎉 The ${this.options.name} recipe has been installed!\n`,
      )
    } catch (e) {
      baseLogger({displayDateTime: false}).error(e as any)
      return
    }
  }
}
