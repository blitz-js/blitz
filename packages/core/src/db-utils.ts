import {PromiseType} from "types"
import {PaginationArgumentError} from "./errors"

type SeederOptions<T> = {
  amount?: number
  batchSize?: number
  batchInterval?: number
  options?: T
}

type Seeder<T extends Promise<any>, U> = (index: number, options?: U) => T

type Promisable<T> = T | Promise<T>

type Iterator<T, U> = (item: T) => Promisable<U>

type BatchPromises = <T, U>(
  batchSize: number,
  collection: Promisable<T[]>,
  callback: Iterator<T, U>,
) => Promise<U[]>

const batchPromises: BatchPromises = (batchSize, collection, callback) =>
  Promise.resolve(collection).then((arr) =>
    arr
      .map((_, i) => (i % batchSize ? [] : arr.slice(i, i + batchSize)))
      .map((group) => (res: any) => Promise.all(group.map(callback)).then((r) => res.concat(r)))
      .reduce((chain, work) => chain.then(work), Promise.resolve([])),
  )

export const seeder = <T extends Promise<any>, U>(seeder: Seeder<T, U>) => ({
  seed: (options?: SeederOptions<U>) => {
    const seeds: T[] = []

    for (let i = 0; i < (options?.amount || 1); i++) {
      seeds.push(seeder(i, options?.options))
    }

    return batchPromises<T, PromiseType<T>>(
      options?.batchSize || 500,
      seeds,
      (i) =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve(i)
          }, options?.batchInterval || 10),
        ),
    )
  },
})

export const paginate = async <T extends Promise<object[]>>({
  skip,
  take,
  takeMax = 500,
  count: countQuery,
  query,
}: {
  skip: number
  take: number
  takeMax?: number
  count: () => Promise<number>
  query: (payload: {skip: number; take: number}) => T
}) => {
  const skipValid = typeof skip === "number" && skip % 1 === 0 && skip >= 0
  const takeValid = typeof take === "number" && take % 1 === 0 && take > 0 && take <= takeMax

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
