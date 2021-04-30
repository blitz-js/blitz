import {paginate, resolver} from "blitz"

const dataset = Array.from(Array(100).keys())

type Args = {
  skip: number
  take: number
  where?: {value: {gte: number}}
}

export default resolver.pipe(async ({skip = 0, take = 100, where}: Args) => {
  const {items, hasMore, nextPage, count} = await paginate({
    skip,
    take,
    count: async () => dataset.length,
    query: async (paginateArgs) =>
      dataset
        .filter((i) => {
          if (!where) return true
          return i >= where.value.gte
        })
        .slice(paginateArgs.skip, paginateArgs.skip + paginateArgs.take),
  })
  return {
    items,
    hasMore,
    nextPage,
    count,
  }
})
