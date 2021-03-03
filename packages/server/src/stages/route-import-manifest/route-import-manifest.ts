import {Stage, transform} from "@blitzjs/file-pipeline"
import {partition} from "lodash"
import File from "vinyl"

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

export function generateManifest(routes: Record<string, Route>): string {
  const allNames = Object.values(routes).map((r) => r.name)
  const routesWithoutDuplicates = Object.entries(routes).filter(([_path, {name}], index) => {
    const first = allNames.indexOf(name)
    const last = allNames.lastIndexOf(name)
    if (first !== last && first !== index) {
      return false
    }

    return true
  })

  const lines = routesWithoutDuplicates.map(([path, {name, parameters, multipleParameters}]) => {
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

    return `${name}: ({ ${[...parameters, ...multipleParameters].join(", ")} }: { ${[
      ...parameters.map((p) => `${p}: string`),
      ...multipleParameters.map((p) => `${p}: string[]`),
    ].join(", ")} }) => \`${resultingPath}\``
  })

  return "export default {\n" + lines.map((line) => "  " + line).join(",\n") + "\n}"
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

export const createStageRouteImportManifest: Stage = ({getRouteCache}) => {
  const routeCache = getRouteCache()

  const routes: Record<string, Route> = {}

  const stream = transform.file((file, {push}) => {
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

      push(
        new File({
          path: "route-manifest.ts",
          contents: Buffer.from(generateManifest(routes), "utf-8"),
        }),
      )
    }

    addRoute(entry.uri, defaultExportName)

    return file
  })

  return {stream}
}
