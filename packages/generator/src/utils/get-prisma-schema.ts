import * as ast from "@mrleebo/prisma-ast"
import {Editor} from "mem-fs-editor"
import {log} from "../utils/log"
import fs from "fs"
import path from "path"

function getDbFolder() {
  if (fs.existsSync(path.join(process.cwd(), "db"))) {
    return "db"
  }
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json")
    const packageJson = fs.readFileSync(packageJsonPath, "utf8")
    const packageJsonObj = JSON.parse(packageJson)
    if (!packageJsonObj.prisma || !packageJsonObj.prisma.schema) {
      throw new Error(
        "db folder does not exist and Prisma schema not found in package.json. Please either create the db folder or add the prisma schema path to the package.json",
      )
    }
    const prismaSchemaPath = path.join(process.cwd(), packageJsonObj.prisma.schema)
    if (!fs.existsSync(prismaSchemaPath)) {
      throw new Error(
        "prisma.schema file not found. Please either create the db folder or add the prisma schema path to the package.json",
      )
    }
    const folder = packageJsonObj.prisma.schema.split("/")[0] as string
    return folder
  } catch (e) {
    throw e
  }
}

export const getPrismaSchema = (memFsEditor: Editor): {schema: ast.Schema; schemaPath: string} => {
  const dbFolder = getDbFolder()
  const schemaPath = path.join(process.cwd(), dbFolder, "schema.prisma")

  let schema: ast.Schema
  try {
    schema = ast.getSchema(memFsEditor.read(schemaPath))
  } catch (err) {
    log.debug("Failed to parse db/schema.prisma file")
    throw err
  }
  return {schema, schemaPath}
}
