import {Stage, transform} from "@blitzjs/file-pipeline"
import {OverrideTriage} from "@blitzjs/file-pipeline/src/helpers/work-optimizer"
import * as fs from "fs-extra"
import {debounce, partition} from "lodash"
import {join} from "path"
import File from "vinyl"

function makeDebouncedWriter(path: string, ms = 100): (contents: string) => void {
  return debounce((contents: string) => {
    fs.outputFileSync(path, contents, {encoding: "utf-8"})
  }, ms)
}

interface Route {
  name: string
  parameters: string[]
  multipleParameters: string[]
}

export function parseDefaultExportName(contents: string): string | null {
  const result = contents.match(/export\s+default(?:\s+(?:const|let|class|var|function))?\s+(\w+)/)
  if (!result) {
    return null
  }

  return result[1] ?? null
}

const isPage = (path: string) =>
  path.includes(join("pages", "/")) &&
  !path.includes(join("pages", "api", "/")) &&
  !path.includes(join("/", "_app.")) &&
  !path.includes(join("/", "_document."))

function dedupeBy<T, K>(arr: T[], by: (v: T) => K): T[] {
  const allKeys = arr.map(by)
  return arr.filter((v, index) => {
    const key = by(v)
    const first = allKeys.indexOf(key)
    const last = allKeys.lastIndexOf(key)
    if (first !== last && first !== index) {
      return false
    }

    return true
  })
}

export function generateManifest(
  routes: Record<string, Route>,
): {implementation: string; declaration: string} {
  const routesWithoutDuplicates = dedupeBy(Object.entries(routes), ([_path, {name}]) => name)

  const implementationLines = routesWithoutDuplicates.map(
    ([path, {name}]) => `${name}: (query) => ({ pathname: "${path}", query })`,
  )

  const declarationLines = routesWithoutDuplicates.map(
    ([_path, {name, parameters, multipleParameters}]) => {
      if (parameters.length === 0 && multipleParameters.length === 0) {
        return `${name}(query?: ParsedUrlQueryInput): UrlObject`
      }

      return `${name}(query: { ${[
        ...parameters.map((param) => param + ": string"),
        ...multipleParameters.map((param) => param + ": string[]"),
      ].join("; ")} } & ParsedUrlQueryInput): UrlObject`
    },
  )

  return {
    implementation:
      "exports.Routes = {\n" + implementationLines.map((line) => "  " + line).join(",\n") + "\n}",
    declaration: `
import type { UrlObject } from "url"
import type { ParsedUrlQueryInput } from "querystring"

export const Routes: {
${declarationLines.map((line) => "  " + line).join(";\n")};
}`.trim(),
  }
}

export function parseParametersFromRoute(
  path: string,
): Pick<Route, "parameters" | "multipleParameters"> {
  const parameteredSegments = path.match(/\[.*?\]/g) ?? []
  const withoutBrackets = parameteredSegments.map((p) => p.substring(1, p.length - 1))

  const [multipleParameters, parameters] = partition(withoutBrackets, (p) => p.startsWith("..."))

  return {
    parameters,
    multipleParameters: multipleParameters.map((p) => p.replace("...", "")),
  }
}

export const createStageRouteImportManifest: Stage & {overrideTriage: OverrideTriage} = ({
  getRouteCache,
  config,
}) => {
  const routeCache = getRouteCache()

  const routes: Record<string, Route> = {}

  const dotBlitz = join(config.src, "node_modules", ".blitz")

  const writeManifestImplementation = makeDebouncedWriter(join(dotBlitz, "index.js"))
  const writeManifestBrowserImplementation = makeDebouncedWriter(join(dotBlitz, "index-browser.js"))
  const writeManifestDeclaration = makeDebouncedWriter(join(dotBlitz, "index.d.ts"))

  const stream = transform.file((file) => {
    if (!isPage(file.relative)) {
      return file
    }

    const defaultExportName = parseDefaultExportName(file.contents?.toString() ?? "")
    if (!defaultExportName) {
      return file
    }

    const entry = routeCache.get(file)
    if (!entry) {
      return file
    }

    function addRoute(path: string, defaultExportName: string) {
      routes[path] = {
        ...parseParametersFromRoute(path),
        name: defaultExportName,
      }

      const {declaration, implementation} = generateManifest(routes)

      writeManifestImplementation(implementation)
      writeManifestBrowserImplementation(implementation)
      writeManifestDeclaration(declaration)
    }

    addRoute(entry.uri, defaultExportName)

    return file
  })

  return {stream}
}

createStageRouteImportManifest.overrideTriage = (file: File) => {
  if (isPage(file.relative)) {
    return "proceed"
  }

  return undefined
}
