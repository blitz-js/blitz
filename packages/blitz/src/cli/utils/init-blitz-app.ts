import fs from "fs"
import {loadEnvConfig} from "../../env-utils"
import {AppGenerator, AppGeneratorOptions, getLatestVersion} from "@blitzjs/generator"

type Template = "full" | "minimal"
const templates: {[key in Template]: AppGeneratorOptions["template"]} = {
  full: {
    path: "app",
  },
  minimal: {
    path: "minimalapp",
    skipForms: true,
    skipDatabase: true,
  },
}

export async function initBlitzApp({
  projectPath,
  projectName,
}: {
  projectPath: string
  projectName: string
}): Promise<void> {
  await fs.promises.mkdir(projectPath, {recursive: true})

  // const generator = new AppGenerator({
  //   template: {
  //     path: "app",
  //   },
  //   destinationRoot: projectPath,
  //   appName: projectName,
  //   dryRun: false,
  //   useTs: true,
  //   yarn: true,
  //   version: "1.0",
  //   skipInstall: false,
  //   form: "React Final Form",
  //   skipGit: false,
  //   onPostInstall: async () => {

  //     try {
  //       // loadEnvConfig is required in order for DATABASE_URL to be available
  //       // don't print info logs from loadEnvConfig for clear output
  //       loadEnvConfig(
  //         process.cwd(),
  //         undefined,
  //         {error: console.error, info: () => {}},
  //         {ignoreCache: true},
  //       )
  //     } catch(error) {

  //     }

  //   }
  // })

  // await generator.run()
}
