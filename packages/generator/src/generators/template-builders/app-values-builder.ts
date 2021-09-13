import {AppGeneratorOptions} from "../.."
import {Builder} from "./builder"
import username from "username"

export class AppValuesBuilder extends Builder<AppGeneratorOptions> {
  public async getTemplateValues(options: AppGeneratorOptions) {
    const values = {
      name: options.appName,
      safeNameSlug: options.appName.replace(/[^a-zA-Z0-9-_]/g, "-"),
      username: await username(),
    }
    return values
  }
}
