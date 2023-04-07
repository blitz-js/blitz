import username from "username"
import {AppGeneratorOptions, AppTemplateValues} from "../.."
import {Builder} from "./builder"

export class AppValuesBuilder extends Builder<AppGeneratorOptions, AppTemplateValues> {
  public async getTemplateValues(options: AppGeneratorOptions): Promise<AppTemplateValues> {
    const values = {
      name: options.appName,
      safeNameSlug: options.appName.replace(/[^a-zA-Z0-9-_]/g, "-"),
      username: await username(),
    }
    return values
  }
}
