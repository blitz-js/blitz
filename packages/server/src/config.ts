import {transformFiles} from "@blitzjs/file-pipeline"
import {join, resolve} from "path"
import {parseChokidarRulesFromGitignore} from "./parse-chokidar-rules-from-gitignore"
import {resolveBinAsync} from "./resolve-bin-async"

type Synchronizer = typeof transformFiles

export type ServerConfig = {
  rootFolder: string
  buildFolder?: string
  devFolder?: string
  // -
  isTypescript?: boolean
  watch?: boolean
  // -
  transformFiles?: Synchronizer
  writeManifestFile?: boolean
  // -
  port?: number
  hostname?: string
}

type NormalizedConfig = ServerConfig & {
  buildFolder: string
  devFolder: string
  // -
  isTypescript: boolean
  watch: boolean
  // -
  transformFiles: Synchronizer
  writeManifestFile: boolean
  // -
  ignore: string[]
  include: string[]
  // -
  nextBin: string
}

const defaults = {
  buildFolder: ".blitz/caches/build",
  devFolder: ".blitz/caches/dev",
  // -
  writeManifestFile: true,
  // -
  ignoredPaths: [
    "./build/**/*",
    "./.blitz-*/**/*",
    "./.blitz/**/*",
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
}

export async function normalize(
  config: ServerConfig,
  dev: boolean = false,
): Promise<NormalizedConfig> {
  const rootFolder = resolve(process.cwd(), config.rootFolder)
  const git = parseChokidarRulesFromGitignore(rootFolder)

  return {
    ...config,
    // -
    rootFolder,
    buildFolder: resolve(rootFolder, config.buildFolder ?? defaults.buildFolder),
    devFolder: resolve(rootFolder, config.devFolder ?? defaults.devFolder),
    // -
    isTypescript: config.isTypescript ?? (await getIsTypescript(rootFolder)),
    watch: config.watch ?? dev,
    // -
    transformFiles: config.transformFiles ?? transformFiles,
    writeManifestFile: config.writeManifestFile ?? defaults.writeManifestFile,
    // -
    ignore: defaults.ignoredPaths.concat(git.ignoredPaths),
    include: defaults.includePaths.concat(git.includePaths),
    // -
    nextBin: await getNextBin(rootFolder, dev),
  }
}

async function getNextBin(rootFolder: string, dev: boolean = false) {
  // do not await for both bin-pkg because just one is used at a time
  const nextBinPkg = dev ? "@blitzjs/server" : "next"
  const nextBinExec = dev ? "next-patched" : undefined
  const nextBin = await resolveBinAsync(nextBinPkg, nextBinExec)
  return resolve(rootFolder, nextBin)
}

async function getIsTypescript(rootFolder: string) {
  const fs = await import("fs")
  return fs.existsSync(join(rootFolder, "tsconfig.json"))
}
