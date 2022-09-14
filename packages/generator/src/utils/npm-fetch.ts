import got from "got"

type PackageInformation = any
export type NpmDepResponse = {versions: Record<string, PackageInformation>}

export const fetchAllVersions = async (dependency: string) => {
  const res = (await got(`https://registry.npmjs.org/${dependency}`, {
    retry: {limit: 3},
    timeout: 3000,
    responseType: "json",
  }).json<NpmDepResponse>()) as unknown as NpmDepResponse
  return Object.keys(res.versions)
}

export const fetchDistTags = async (dependency: string) => {
  const res = (await got(`https://registry.npmjs.org/-/package/${dependency}/dist-tags`, {
    retry: {limit: 3},
    timeout: 3000,
    responseType: "json",
  }).json()) as unknown as Record<string, any>
  return res
}

export const fetchLatestDistVersion = async (dependency: string) => {
  const res = await fetchDistTags(dependency)
  return res.latest
}
