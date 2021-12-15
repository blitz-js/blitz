import fs from "fs"
import {baseLogger} from "next/dist/server/lib/logging"
import * as path from "path"
import {SourceRootType} from "../generator.js"

export const getTemplateRoot = (
  templateDir: string | undefined,
  fallback: SourceRootType,
): SourceRootType => {
  if (!templateDir) {
    return fallback
  }
  const templatePath = path.join(templateDir, fallback.path)
  if (!fs.existsSync(templatePath)) {
    baseLogger({displayDateTime: false}).info(
      `Template path "${templatePath}" does not exist. Falling back to the default template.`,
    )
    return fallback
  }

  return {path: templatePath, type: "absolute"}
}
