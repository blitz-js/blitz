import {ServerEnvironment} from "../config"
import {createStageConfig} from "./config"
import {createStageManifest} from "./manifest"
import {createStagePages} from "./pages"
import {createStageRelative} from "./relative"
import {createStageRewriteImports} from "./rewrite-imports"
import {createStageRouteImportManifest} from "./route-import-manifest/route-import-manifest"
import {createStageRoutes} from "./routes"
import {createStageRpc} from "./rpc"

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
    createStagePages,
    createStageRpc(config.isTypeScript),
    createStageRoutes,
    createStageRouteImportManifest,
    createStageConfig,
    await createStageManifest(config.writeManifestFile, config.buildFolder, config.env),
  ],
})

export const configureRouteStages = (config: StagesConfig) => [
  createStagePages,
  createStageRpc(config.isTypeScript),
  createStageRoutes,
]

export const configureGenerateStages = () => [
  createStagePages,
  createStageRoutes,
  createStageRouteImportManifest,
]
