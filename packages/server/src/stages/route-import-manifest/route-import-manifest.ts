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
  path.includes("pages/") &&
  !path.includes("pages/api/") &&
  !path.includes("/_app.") &&
  !path.includes("/_document.")

export function generateManifest(
  routes: Record<string, Route>,
): {implementation: string; declaration: string} {
  const allNames = Object.values(routes).map((r) => r.name)
  const routesWithoutDuplicates = Object.entries(routes).filter(([_path, {name}], index) => {
    const first = allNames.indexOf(name)
    const last = allNames.lastIndexOf(name)
    if (first !== last && first !== index) {
      return false
    }

    return true
  })

  const implementationLines = routesWithoutDuplicates.map(
    ([path, {name, parameters, multipleParameters}]) => {
      if (parameters.length === 0 && multipleParameters.length === 0) {
        return `${name}: "${path}"`
      }

      let resultingPath = path

      parameters.forEach((parameter) => {
        resultingPath = resultingPath.replace(`[${parameter}]`, `\${${parameter}}`)
      })

      multipleParameters.forEach((parameter) => {
        resultingPath = resultingPath.replace(`[...${parameter}]`, `\${${parameter}.join("/")}`)
      })

      const allParameters = [...parameters, ...multipleParameters]

      return `${name}: ({ ${allParameters.join(", ")} }) => \`${resultingPath}\``
    },
  )

  const declarationLines = routesWithoutDuplicates.map(
    ([path, {name, parameters, multipleParameters}]) => {
      if (parameters.length === 0 && multipleParameters.length === 0) {
        return `${name}: string`
      }

      let resultingPath = path

      parameters.forEach((parameter) => {
        resultingPath = resultingPath.replace(`[${parameter}]`, `\${${parameter}}`)
      })

      multipleParameters.forEach((parameter) => {
        resultingPath = resultingPath.replace(`[...${parameter}]`, `\${${parameter}.join("/")}`)
      })

      return `${name}({ ${[...parameters, ...multipleParameters].join(", ")} }: { ${[
        ...parameters.map((p) => `${p}: string`),
        ...multipleParameters.map((p) => `${p}: string[]`),
      ].join(", ")} }): string`
    },
  )

  return {
    implementation:
      "export default {\n" + implementationLines.map((line) => "  " + line).join(",\n") + "\n}",
    declaration:
      "declare const _default: {\n" +
      declarationLines.map((line) => "  " + line).join(";\n") +
      ";\n}\nexport default _default;",
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

  const writeManifestImplementation = makeDebouncedWriter(join(dotBlitz, "route-manifest.js"))

  const writeManifestDeclaration = makeDebouncedWriter(join(dotBlitz, "route-manifest.d.ts"))

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
