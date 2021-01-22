import {PaginationArgumentError} from "./errors"
import {PromiseType} from "./types"

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

// type PaginateArgs<QueryResult> = {
//   skip?: number
//   take?: number
//   maxTake?: number
//   count: () => Promise<number>
//   query: (args: {skip: number; take: number}) => Promise<QueryResult>
// }
//
// export async function paginate<QueryResult>({
//   skip = 0,
//   take = 0,
//   maxTake = 500,
//   count: countQuery,
//   query,
// }: PaginateArgs<QueryResult>) {
//   const skipValid = typeof skip === "number" && skip % 1 === 0 && skip >= 0
//   const takeValid = typeof take === "number" && take % 1 === 0 && take > 0 && take <= maxTake
//
//   if (!skipValid) {
//     throw new PaginationArgumentError("The skip argument is invalid")
//   }
//
//   if (!takeValid) {
//     throw new PaginationArgumentError("The take argument is invalid")
//   }
//
//   const [count, items] = await Promise.all([countQuery(), query({skip, take})])
//
//   const hasMore = skip + take < count
//   const nextPage = hasMore ? {take, skip: skip + take} : null
//
//   return {
//     items,
//     nextPage,
//     hasMore,
//     count,
//   }
// }

interface FindManyArgs {
  skip?: number
  take?: number
}

interface PrismaDelegate {
  count<T extends FindManyArgs>(findManyArgs: T): Promise<number>
  findMany<T extends FindManyArgs>(findManyArgs: T): any
}

export async function paginate<PrismaModel extends PrismaDelegate>(
  prismaModel: PrismaModel,
  args: Parameters<PrismaModel["findMany"]>[0],
) {
  const maxTake = 500
  const skipValid = typeof args.skip === "number" && args.skip % 1 === 0 && args.skip >= 0
  const takeValid =
    typeof args.take === "number" && args.take % 1 === 0 && args.take > 0 && args.take <= maxTake

  if (!skipValid) {
    throw new PaginationArgumentError("The skip argument is invalid")
  }

  if (!takeValid) {
    throw new PaginationArgumentError("The take argument is invalid")
  }

  const {select, include, ...countArgs} = args as any
  const [count, items] = await Promise.all([
    prismaModel.count(countArgs),
    prismaModel.findMany(args),
  ])

  const hasMore = args.skip! + args.take! < count
  const nextPage = hasMore ? {take: args.take, skip: args.skip! + args.take!} : null

  return {
    // items: items as PromiseReturnType<PrismaModel["findMany"]>,
    items,
    nextPage,
    hasMore,
    count,
  }
}
