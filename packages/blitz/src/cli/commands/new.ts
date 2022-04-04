import {initBlitzApp} from "../utils/init-blitz-app"
import prompts from "prompts"
import path from "path"
import chalk from "chalk"
import {cliCommand} from "../index"

const newApp: cliCommand = async (argv) => {
  let projectName: string = ""
  let projectPath: string = ""

  const res = await prompts({
    type: "text",
    name: "name",
    message: "What would you like to name your project?",
    initial: "blitz-app",
  })
  projectName = res.name.trim().replaceAll(" ", "-")
  projectPath = path.resolve(projectName)

  await initBlitzApp({
    projectPath,
    projectName,
  })

  console.log(
    `Your project name is: ${chalk.green.bold(projectName)} at the path: ${chalk.green.bold(
      projectPath,
    )}`,
  )
}

export {newApp}
