import got from 'got'

type PackageInformation = any
type NpmDepResponse = {versions: Record<string, PackageInformation>}

export const fetchAllVersions = async (dependency: string) => {
  try {
    const res = await got(`https://registry.npmjs.org/${dependency}`, {
      retry: {limit: 2},
      responseType: 'json',
    }).json<NpmDepResponse>()
    return Object.keys(res.versions)
  } catch (error) {
    return undefined
  }
}

type NpmDistTagsResponse = {latest: string; canary: string}

export const fetchDistTags = async (dependency: string) => {
  try {
    const res = await got(`https://registry.npmjs.org/-/package/${dependency}/dist-tags`, {
      retry: {limit: 2},
      responseType: 'json',
    }).json<NpmDistTagsResponse>()
    return res
  } catch (errror) {
    return undefined
  }
}

export const fetchLatestDistVersion = async (dependency: string) => {
  const res = await fetchDistTags(dependency)
  return res?.latest
}
