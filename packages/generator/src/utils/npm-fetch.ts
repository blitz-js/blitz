import got from 'got'

type PackageInformation = any
type NpmDepResponse = {versions: Record<string, PackageInformation>}

export const fetchAllVersions = async (dependency: string) => {
  const res = await got(`https://registry.npmjs.org/${dependency}`, {
    retry: {limit: 3},
    responseType: 'json',
  }).json<NpmDepResponse>()
  return Object.keys(res.versions)
}

type NpmDistTagsResponse = {latest: string; canary: string}

export const fetchDistTags = async (dependency: string) => {
  const res = await got(`https://registry.npmjs.org/-/package/${dependency}/dist-tags`, {
    retry: {limit: 3},
    responseType: 'json',
  }).json<NpmDistTagsResponse>()
  return res
}

export const fetchLatestDistVersion = async (dependency: string) => {
  const res = await fetchDistTags(dependency)
  return res.latest
}
