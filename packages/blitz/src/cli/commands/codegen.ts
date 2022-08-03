import {CliCommand} from "../index"
import {codegenTasks} from "../utils/codegen-tasks"

const codegen: CliCommand = async () => {
  try {
    await codegenTasks()
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

export {codegen}
