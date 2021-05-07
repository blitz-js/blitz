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

type Parameter = {
  name: string
  optional: boolean
}
interface Route {
  name: string
  parameters: Parameter[]
  multipleParameters: Parameter[]
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
        return `${name}(query?: ParsedUrlQueryInput): RouteUrlObject`
      }

      return `${name}(query: { ${[
        ...parameters.map(
          (param) => param.name + (param.optional ? "?" : "") + ": string | number",
        ),
        ...multipleParameters.map(
          (param) => param.name + (param.optional ? "?" : "") + ": (string | number)[]",
        ),
      ].join("; ")} } & ParsedUrlQueryInput): RouteUrlObject`
    },
  )

  return {
    implementation:
      "exports.Routes = {\n" + implementationLines.map((line) => "  " + line).join(",\n") + "\n}",
    declaration: `
import type { UrlObject } from "url"
import type { ParsedUrlQueryInput } from "querystring"

interface RouteUrlObject extends Pick<UrlObject, 'pathname' | 'query'> {
  pathname: string
}

export const Routes: {
${declarationLines.map((line) => "  " + line).join(";\n")};
}`.trim(),
  }
}

function removeSquareBracketsFromSegments(value: string): string

function removeSquareBracketsFromSegments(value: string[]): string[]

function removeSquareBracketsFromSegments(value: string | string[]): string | string[] {
  if (typeof value === "string") {
    return value.replace("[", "").replace("]", "")
  }
  return value.map((val) => val.replace("[", "").replace("]", ""))
}

const squareBracketsRegex = /\[\[.*?\]\]|\[.*?\]/g

export function parseParametersFromRoute(
  path: string,
): Pick<Route, "parameters" | "multipleParameters"> {
  const parameteredSegments = path.match(squareBracketsRegex) ?? []
  const withoutBrackets = removeSquareBracketsFromSegments(parameteredSegments)

  const [multipleParameters, parameters] = partition(withoutBrackets, (p) => p.includes("..."))

  return {
    parameters: parameters.map((value) => {
      const containsSquareBrackets = squareBracketsRegex.test(value)
      if (containsSquareBrackets) {
        return {
          name: removeSquareBracketsFromSegments(value),
          optional: true,
        }
      }

      return {
        name: value,
        optional: false,
      }
    }),
    multipleParameters: multipleParameters.map((param) => {
      const withoutEllipsis = param.replace("...", "")
      const containsSquareBrackets = squareBracketsRegex.test(withoutEllipsis)

      if (containsSquareBrackets) {
        return {
          name: removeSquareBracketsFromSegments(withoutEllipsis),
          optional: true,
        }
      }

      return {
        name: withoutEllipsis,
        optional: false,
      }
    }),
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
