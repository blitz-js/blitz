import {PromiseReturnType} from "types"
import {PaginationPayloadInvalidError} from "./errors"

type SeederOptions<T> = {
  amount?: number
  options?: T
}

type Seeder<T extends Promise<any>, U> = (index: number, options?: U) => T

export const seeder = <T extends Promise<any>, U>(seeder: Seeder<T, U>) => ({
  seed: async (options?: SeederOptions<U>) => {
    const seeds: PromiseReturnType<typeof seeder>[] = []

    for (const index in [...Array(options?.amount || 1)]) {
      const data = await seeder(Number(index), options?.options)

      seeds.push(data)
    }

    return seeds
  },
})

export const paginate = async <T extends Promise<object[]>>({
  skip,
  take,
  takeMax = 100,
  count,
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

  if (!skipValid || !takeValid) {
    throw new PaginationPayloadInvalidError()
  }

  const itemsCount = await count()
  const hasMore = skip + take < itemsCount
  const nextPage = hasMore ? {take, skip: skip + take} : null

  return {
    items: await query({skip, take}),
    nextPage,
    hasMore,
    itemsCount,
  }
}
