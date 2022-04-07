import {CliCommand} from "../index"
/* @ts-ignore */
import {generateManifest} from "@blitzjs/next"

const codegen: CliCommand = async () => {
  await generateManifest()
}

export {codegen}
