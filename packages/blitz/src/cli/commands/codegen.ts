import {CliCommand} from "../index"
/* @ts-ignore */
import {generateManifest} from "../utils/routes-manifest"

const codegen: CliCommand = async () => {
  await generateManifest(process.cwd())
}

export {codegen}
