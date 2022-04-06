import {cliCommand} from "../index"
/* @ts-ignore */
import {generateManifest} from "@blitzjs/next"

const codegen: cliCommand = async () => {
  await generateManifest()
}

export {codegen}
