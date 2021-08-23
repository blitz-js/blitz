import fs, {promises} from "fs"
import {join, resolve} from "path"
import {resolveBinAsync} from "./resolve-bin-async"

export type ServerEnvironment = "dev" | "prod"

export type ServerConfig = {
  rootFolder: string
  buildFolder?: string
  routesFolder?: string
  clean?: boolean
  // -
  isTypeScript?: boolean
  watch?: boolean
  // -
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
  routesFolder: string
  clean?: boolean
  // -
  isTypeScript: boolean
  watch: boolean
  // -
  writeManifestFile: boolean
  // -
  ignore: string[]
  include: string[]
  // -
  nextBin: string
  env: ServerEnvironment
}

export const standardBuildFolderPath = ".blitz/build"
export const standardBuildFolderPathRegex = /\.blitz[\\/]build[\\/]/g

// https://stackoverflow.com/questions/20010199/how-to-determine-if-a-process-runs-inside-lxc-docker
function isInDocker(): boolean {
  const cgroupFile = join("proc", "self", "cgroup")
  if (fs.existsSync(cgroupFile)) {
    const content = fs.readFileSync(cgroupFile, "utf-8")
    return content.includes("docker")
  }
  return false
}

const defaults = {
  hostname: isInDocker() ? "0.0.0.0" : "127.0.0.1",
  // -
  env: "prod" as ServerEnvironment,
  // -
  buildFolder: standardBuildFolderPath,
  routesFolder: ".blitz/routes",
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

  const env = config.env || defaults.env

  return {
    ...config,
    hostname: config.hostname ?? defaults.hostname,
    env,
    // -
    rootFolder,
    buildFolder: resolve(rootFolder, config.buildFolder ?? defaults.buildFolder),
    routesFolder: resolve(rootFolder, config.routesFolder ?? defaults.routesFolder),
    // -
    isTypeScript: config.isTypeScript ?? (await getIsTypeScript(rootFolder)),
    watch: config.watch ?? env === "dev",
    clean: config.clean,
    // -
    writeManifestFile: config.writeManifestFile ?? defaults.writeManifestFile,
    // -
    ignore: defaults.ignoredPaths.concat(),
    include: defaults.includePaths.concat(),
    // -
    nextBin: await getNextBin(rootFolder, env === "dev"),
  }
}

async function getNextBin(rootFolder: string, _usePatched: boolean = false): Promise<string> {
  const nextBinPkg = "next"
  const nextBin = await resolveBinAsync(nextBinPkg)
  return resolve(rootFolder, nextBin)
}

async function getIsTypeScript(rootFolder: string): Promise<boolean> {
  try {
    await promises.access(join(rootFolder, "tsconfig.json"))
    return true
  } catch {
    return false
  }
}
