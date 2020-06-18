const getMap = <Key, Value>(
  map: Map<Key, NonNullable<Value>>,
  key: Key,
  defaultValue?: NonNullable<Value>,
): NonNullable<Value> => {
  const existing = map.get(key)

  if (existing === undefined) {
    if (defaultValue === undefined) {
      throw new Error("Key didn't exist and no defaultValue passed")
    }

    map.set(key, defaultValue)

    return defaultValue
  } else {
    return existing
  }
}

const compareTwoStrings = (aStr: string, bStr: string): number => {
  const a = aStr.replace(/\s+/g, '')
  const b = bStr.replace(/\s+/g, '')

  if (!a.length && !b.length) {
    return 1
  }

  if (!a.length || !b.length) {
    return 0
  }

  if (a === b) {
    return 1
  }

  if (a.length === 1 && b.length === 1) {
    return 0
  }

  if (a.length < 2 || b.length < 2) {
    return 0
  }

  let firstBigrams: Map<string, number> = new Map()

  for (let i = 0; i < a.length - 1; i++) {
    const bigram = a.substring(i, i + 2)

    const count = firstBigrams.has(bigram) ? getMap(firstBigrams, bigram) + 1 : 1

    if (count === undefined) {
      throw new Error('Already used has() above')
    }

    firstBigrams.set(bigram, count)
  }

  let intersectionSize: number = 0

  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.substring(i, i + 2)

    const count = getMap(firstBigrams, bigram, 0)

    if (count === undefined) {
      throw new Error('Already used has() above')
    }

    if (count > 0) {
      firstBigrams.set(bigram, count - 1)
      intersectionSize++
    }
  }

  return (2 * intersectionSize) / (a.length + b.length - 2)
}

type Rating = {
  target: string
  rating: number
}

type Ratings = Array<Rating>

type OrderBySimilarityOptions = {
  minRating?: number
  formatItem?: (str: string) => string
  ignoreCase?: boolean
}

export const orderBySimilarity = (
  compareStr: string,
  targets: Array<string>,
  {minRating, formatItem, ignoreCase = false}: OrderBySimilarityOptions = {},
): Ratings => {
  if (targets.length === 0) {
    return []
  }

  const ratings: Ratings = Array.from(
    targets,
    (target: string): Rating => {
      let compareTarget = target

      if (formatItem !== undefined) {
        compareTarget = formatItem(target)
      }

      if (ignoreCase) {
        return {
          target,
          rating: compareTwoStrings(compareStr.toLowerCase(), compareTarget.toLowerCase()),
        }
      }

      return {
        target,
        rating: compareTwoStrings(compareStr, compareTarget),
      }
    },
  )

  const sortedRatings: Ratings = ratings
    .sort((a, b) => {
      return b.rating - a.rating
    })
    .filter((item) => minRating === undefined || item.rating >= minRating)

  return sortedRatings
}
