import {orderBySimilarity} from "./orderBySimilarity"

export const findClosestStringMatch = (
  name: string,
  matches: Array<string>,
  minRating: number = 0.8,
): undefined | string => {
  if (matches.length === 0) {
    return undefined
  }

  if (matches.length === 1) {
    return matches[0]
  }

  const ratings = orderBySimilarity(name, matches)
  const bestMatch = ratings[0]

  if (bestMatch.rating >= minRating) {
    return bestMatch.target
  } else {
    return undefined
  }
}
