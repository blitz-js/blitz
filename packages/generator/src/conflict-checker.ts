import chalk from "chalk"
import {Change, diffLines} from "diff"
import enquirer from "enquirer"
import * as fs from "fs-extra"
import * as path from "path"
import {Transform, TransformCallback} from "stream"
import File from "vinyl"
import {PromptAbortedError} from "./errors/prompt-aborted"

interface PromptAnswer {
  action: "overwrite" | "skip" | "show"
}

type PromptActions = "create" | "overwrite" | "skip" | "identical"

interface ConflictCheckerOptions {
  dryRun?: boolean
}

export class ConflictChecker extends Transform {
  private _destroyed = false

  constructor(private readonly options?: ConflictCheckerOptions) {
    super({
      objectMode: true,
    })
  }

  _transform(file: File, _encoding: string, cb: TransformCallback): void {
    if (file.state === null) {
      cb()
      return
    }

    // If the file doesn't exists yet there isn't any diff to perform
    const filePath = path.resolve(file.path)
    if (!fs.existsSync(filePath)) {
      this.handlePush(file, "create")
      cb()
      return
    }

    this.checkDiff(file)
      .then((status) => {
        if (status !== "skip") {
          this.handlePush(file, status)
        } else {
          this.fileStatusString(file, status, this.options?.dryRun)
        }

        cb()
      })
      .catch((err) => {
        // If the error is an empty string, it means that the user has
        // stopped the prompt with ctrl-c so we return PromptAbortedError
        // to end the program without writing anything to disk
        cb(err || new PromptAbortedError())
      })
  }

  destroy(err?: Error): void {
    if (this._destroyed) return
    this._destroyed = true

    process.nextTick(() => {
      if (err) this.emit("err", err)
      this.emit("close")
    })
  }

  handlePush(file: File, status: PromptActions): void {
    if (!this.options?.dryRun) this.push(file)

    this.emit("fileStatus", this.fileStatusString(file, status, this.options?.dryRun))
  }

  private async checkDiff(file: File): Promise<PromptActions> {
    let newFileContents = file.contents?.toString() ?? ""
    const oldFileContents = fs.readFileSync(path.resolve(file.path)).toString()

    const diff = diffLines(oldFileContents, newFileContents)

    const conflict = diff.some((line) => line.added || line.removed)

    if (conflict) {
      let answer = null
      do {
        answer = await enquirer.prompt<PromptAnswer>({
          type: "select",
          name: "action",
          message: `The file "${file.path}" has conflicts. What do you want to do?`, // Maybe color file.path
          choices: [
            {name: "overwrite", message: "Overwrite", value: "overwrite"},
            {name: "skip", message: "Skip", value: "skip"},
            {name: "show", message: "Show changes", value: "show"},
          ],
        })

        if (answer?.action === "show") this.printDiff(diff)
      } while (answer?.action === "show")

      return answer.action
    }

    return "identical"
  }

  private printDiff(diff: Change[]) {
    console.log("\n")
    diff.forEach((line) => {
      const value = line.value.replace("\n", "")
      if (line.added) {
        console.log(chalk.green(`+ ${value}`))
      } else if (line.removed) {
        console.log(chalk.red(`- ${value}`))
      } else {
        console.log(value)
      }
    })
    console.log("\n")
  }

  private fileStatusString(file: File, status: PromptActions, dryRun: boolean = false) {
    let statusLog = null
    switch (status) {
      case "create":
        statusLog = chalk.green(`${dryRun ? "Would create" : "CREATE"}   `)
        break
      case "overwrite":
        statusLog = chalk.cyan(`${dryRun ? "Would overwrite" : "OVERWRITE"}   `)
        break
      case "skip":
        statusLog = chalk.blue("SKIP     ")
        break
      case "identical":
        statusLog = chalk.gray("IDENTICAL")
    }

    return `${statusLog} ${file.relative}`
  }
}
