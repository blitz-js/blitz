import {resolve} from "path"
import {resolveBinAsync} from "./resolve-bin-async"
import {transformFiles} from "@blitzjs/file-pipeline"
import {parseChokidarRulesFromGitignore} from "./parse-chokidar-rules-from-gitignore"

type Synchronizer = typeof transformFiles

export type ServerConfig = {
  rootFolder: string
  port?: number
  hostname?: string
  interceptNextErrors?: boolean
  devFolder?: string
  buildFolder?: string
  writeManifestFile?: boolean
  watch?: boolean
  transformFiles?: Synchronizer
  isTypescript?: boolean
}

type NormalizedConfig = Omit<ServerConfig, "interceptNextErrors"> & {
  ignore: string[]
  include: string[]
  nextBin: string
  devFolder: string
  buildFolder: string
  transformFiles: Synchronizer
  writeManifestFile: boolean
  watch: boolean
  isTypescript: boolean
}

const defaults = {
  ignoredPaths: [
    "./build/**/*",
    "./.blitz-*/**/*",
    "./.blitz/**/*",
    "./.heroku/**/*",
    "./.profile.d/**/*",
    "./.cache/**/*",
    "./.config/**/*",
    ".DS_Store",
    ".git/**/*",
    ".next/**/*",
    "*.log",
    ".vercel/**/*",
    ".now/**/*",
    "*.pnp.js",
    "coverage/**/*",
    "dist/**/*",
    "node_modules/**/*",
    "cypress/**/*",
  ],
  includePaths: ["**/*"],
  devFolder: ".blitz/caches/dev",
  buildFolder: ".blitz/caches/build",
  nextBinPatched: "./node_modules/.bin/next-patched",
  writeManifestFile: true,
}

export async function normalize(config: ServerConfig): Promise<NormalizedConfig> {
  const nextBinOrig = await resolveBinAsync("next")
  const nextBinPatched = await resolveBinAsync("@blitzjs/server", "next-patched")
  const git = parseChokidarRulesFromGitignore(resolve(process.cwd(), config.rootFolder))

  return {
    ...config,
    buildFolder: resolve(config.rootFolder, config.buildFolder ?? defaults.buildFolder),
    devFolder: resolve(config.rootFolder, config.devFolder ?? defaults.devFolder),
    ignore: defaults.ignoredPaths.concat(git.ignoredPaths),
    include: defaults.includePaths.concat(git.includePaths),
    nextBin: resolve(config.rootFolder, config.interceptNextErrors ? nextBinPatched : nextBinOrig),
    transformFiles: config.transformFiles ?? transformFiles,
    watch: config.watch ?? false,
    writeManifestFile: config.writeManifestFile ?? defaults.writeManifestFile,
    isTypescript: config.isTypescript ?? true,
  }
}
