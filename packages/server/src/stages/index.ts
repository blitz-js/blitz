import {createStageConfig} from "./config"
import {createStageManifest} from "./manifest"
import {createStagePages} from "./pages"
import {createStageRelative} from "./relative"
import {createStageRewriteImports} from "./rewrite-imports"
import {createStageRpc} from "./rpc"

type StagesConfig = {writeManifestFile: boolean; isTypescript: boolean}

// These create pipeline stages that are run as the business rules for Blitz
// Read this folders README for more information
export const configureStages = (config: StagesConfig) => [
  // Order is important
  createStageRelative,
  createStageRewriteImports,
  createStagePages,
  createStageRpc(config.isTypescript),
  createStageConfig,
  createStageManifest(config.writeManifestFile),
]
