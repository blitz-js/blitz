import {PaginationArgumentError} from "./errors"

type PaginateArgs<QueryResult> = {
  skip?: number
  take?: number
  maxTake?: number
  count: () => Promise<number>
  query: (args: {skip: number; take: number}) => Promise<QueryResult>
}

export async function paginate<QueryResult>({
  skip = 0,
  take = 0,
  maxTake = 250,
  count: countQuery,
  query,
}: PaginateArgs<QueryResult>) {
  const skipValid = typeof skip === "number" && skip % 1 === 0 && skip >= 0
  const takeValid = typeof take === "number" && take % 1 === 0 && take > 0 && take <= maxTake

  if (!skipValid) {
    throw new PaginationArgumentError("The skip argument is invalid")
  }

  if (!takeValid) {
    throw new PaginationArgumentError("The take argument is invalid")
  }

  const [count, items] = await Promise.all([countQuery(), query({skip, take})])

  const hasMore = skip + take < count
  const nextPage = hasMore ? {take, skip: skip + take} : null

  return {
    items,
    nextPage,
    hasMore,
    count,
  }
}
