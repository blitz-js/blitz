import {transformFiles} from "@blitzjs/file-pipeline"
import {promises} from "fs"
import {join, resolve} from "path"
import {parseChokidarRulesFromGitignore} from "./parse-chokidar-rules-from-gitignore"
import {resolveBinAsync} from "./resolve-bin-async"

type Synchronizer = typeof transformFiles
type ServerEnvironment = "dev" | "prod"

export type ServerConfig = {
  rootFolder: string
  buildFolder?: string
  devFolder?: string
  routeFolder?: string
  clean?: boolean
  // -
  isTypescript?: boolean
  watch?: boolean
  // -
  transformFiles?: Synchronizer
  writeManifestFile?: boolean
  // -
  port?: number
  hostname?: string
  inspect?: boolean
  // –
  env: ServerEnvironment
}

type NormalizedConfig = ServerConfig & {
  buildFolder: string
  devFolder: string
  routeFolder: string
  clean?: boolean
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
  env: ServerEnvironment
}

const defaults = {
  env: "prod" as ServerEnvironment,
  // -
  buildFolder: ".blitz/caches/build",
  devFolder: ".blitz/caches/dev",
  routeFolder: ".blitz/caches/routes",
  // -
  writeManifestFile: true,
  // -
  ignoredPaths: [
    "./build/**/*",
    "**/.blitz-*/**/*",
    "**/.blitz/**/*",
    "**/.heroku/**/*",
    "**/.profile.d/**/*",
    "**/.cache/**/*",
    "./.config/**/*",
    "**/.DS_Store",
    "**/.git/**/*",
    "**/.next/**/*",
    "**/*.log",
    "**/.vercel/**/*",
    "**/.now/**/*",
    "**/*.pnp.js",
    "**/*.sqlite*",
    "coverage/**/*",
    ".coverage/**/*",
    "dist/**/*",
    "**/node_modules/**/*",
    "cypress/**/*",
    "test/**/*",
    "tests/**/*",
    "spec/**/*",
    "specs/**/*",
    "**/*.test.*",
    "**/*.spec.*",
    "**/.yalc/**/*",
  ],
  includePaths: ["**/*"],
}

export async function normalize(config: ServerConfig): Promise<NormalizedConfig> {
  const rootFolder = resolve(process.cwd(), config.rootFolder)
  const git = parseChokidarRulesFromGitignore(rootFolder)

  const env = config.env || defaults.env

  return {
    ...config,
    env,
    // -
    rootFolder,
    buildFolder: resolve(rootFolder, config.buildFolder ?? defaults.buildFolder),
    devFolder: resolve(rootFolder, config.devFolder ?? defaults.devFolder),
    routeFolder: resolve(rootFolder, config.routeFolder ?? defaults.routeFolder),
    // -
    isTypescript: config.isTypescript ?? (await getIsTypescript(rootFolder)),
    watch: config.watch ?? env === "dev",
    clean: config.clean,
    // -
    transformFiles: config.transformFiles ?? transformFiles,
    writeManifestFile: config.writeManifestFile ?? defaults.writeManifestFile,
    // -
    ignore: defaults.ignoredPaths.concat(git.ignoredPaths),
    include: defaults.includePaths.concat(git.includePaths),
    // -
    nextBin: await getNextBin(rootFolder, env === "dev"),
  }
}

async function getNextBin(rootFolder: string, usePatched: boolean = false): Promise<string> {
  // do not await for both bin-pkg because just one is used at a time
  const nextBinPkg = usePatched ? "@blitzjs/server" : "next"
  const nextBinExec = usePatched ? "next-patched" : undefined
  const nextBin = await resolveBinAsync(nextBinPkg, nextBinExec)
  return resolve(rootFolder, nextBin)
}

async function getIsTypescript(rootFolder: string): Promise<boolean> {
  try {
    await promises.access(join(rootFolder, "tsconfig.json"))
    return true
  } catch {
    return false
  }
}
