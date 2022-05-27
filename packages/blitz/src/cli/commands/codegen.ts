import {CliCommand} from "../index"
/* @ts-ignore */
import {generateManifest} from "../utils/routes-manifest"

const codegen: CliCommand = async () => {
  try {
    await generateManifest()
  } catch (err) {
    console.log(err)
  }

  process.exit(0)
}

export {codegen}
