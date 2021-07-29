import {ServerEnvironment} from "../config"
import {createStageManifest} from "./manifest"
import {createStageRelative} from "./relative"
import {createStageRewriteImports} from "./rewrite-imports"
import {createStageRouteImportManifest} from "./route-import-manifest/route-import-manifest"
import {createStageRoutes} from "./routes"

type StagesConfig = {
  writeManifestFile: boolean
  isTypeScript: boolean
  buildFolder: string
  env: ServerEnvironment
}

// These create pipeline stages that are run as the business rules for Blitz
// Read this folders README for more information
export const configureStages = async (config: StagesConfig) => ({
  overrideTriage: createStageRouteImportManifest.overrideTriage,
  stages: [
    // Order is important
    createStageRelative,
    createStageRewriteImports,
    createStageRoutes,
    createStageRouteImportManifest,
    await createStageManifest(config.writeManifestFile, config.buildFolder, config.env),
  ],
})

export const configureRouteStages = (_config: StagesConfig) => [createStageRoutes]

export const configureGenerateStages = () => [createStageRoutes, createStageRouteImportManifest]
