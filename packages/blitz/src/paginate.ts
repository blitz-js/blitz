import {PaginationArgumentError} from "./errors"

export type PaginateArgs<QueryResult> = {
  skip?: number
  take?: number
  maxTake?: number
  count: () => Promise<number>
  query: (args: {skip: number; take: number}) => Promise<QueryResult>
}

const isInteger = (value: unknown) => typeof value === "number" && value % 1 === 0

export async function paginate<QueryResult>({
  skip = 0,
  take = 0,
  maxTake = 250,
  count: countQuery,
  query,
}: PaginateArgs<QueryResult>) {
  if (!isInteger(skip)) {
    throw new PaginationArgumentError("`skip` argument must be a integer")
  }
  if (!isInteger(take)) {
    throw new PaginationArgumentError("`take` argument must be a integer")
  }
  if (!isInteger(maxTake)) {
    throw new PaginationArgumentError("`maxTake` argument must be a integer")
  }
  if (typeof countQuery !== "function") {
    throw new PaginationArgumentError("`count` argument must be a function")
  }
  if (typeof query !== "function") {
    throw new PaginationArgumentError("`query` argument must be a function")
  }
  if (skip < 0) {
    throw new PaginationArgumentError("`skip` argument must be a positive number")
  }
  if (take < 0) {
    throw new PaginationArgumentError("`take` argument must be a positive number")
  }
  if (take > maxTake) {
    throw new PaginationArgumentError(
      "`take` argument must less than `maxTake` which is currently " + maxTake,
    )
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
