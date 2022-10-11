const cache = {}

export default async function getSequence(key: string) {
  cache[key] = cache[key] || 0
  return cache[key]++
}
