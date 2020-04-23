import fetch from 'node-fetch'

export const fetchAllVersions = async (dependency: string) => {
  const res = await fetch(`https://registry.npmjs.org/${dependency}`)
  if (res.ok) {
    const json = await res.json()
    return json.versions as string[]
  } else {
    return
  }
}

export const fetchDistTags = async (dependency: string) => {
  const res = await fetch(`https://registry.npmjs.org/-/package/${dependency}/dist-tags`)
  if (res.ok) {
    const json = await res.json()
    return json as {latest: 'string'; canary: 'string'}
  } else {
    return
  }
}

export const fetchLatestDistVersion = async (dependency: string) => {
  const res = await fetch(`https://registry.npmjs.org/-/package/${dependency}/dist-tags`)
  if (res.ok) {
    const json = await res.json()
    return json.latest as string
  } else {
    return
  }
}
