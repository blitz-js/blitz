import {paginate, seeder} from "../src"

describe("paginate", () => {
  const paginationPayloadInvalidErrorMessage = "The skip or take parameters are invalid"

  const dummyPaginationPromises = {
    count: () => new Promise<number>((resolve) => resolve(1)),
    query: () => new Promise<object[]>((resolve) => resolve([])),
  }

  it("throws an error if skip is not a positive integer", () => {
    const invalidSkipValues = [-1, 0.1, "1"]

    const pagination = async (skip: unknown) =>
      await paginate({
        take: 1,
        skip: skip as number,
        ...dummyPaginationPromises,
      })

    invalidSkipValues.forEach((skip) =>
      expect(pagination(skip)).rejects.toThrow(paginationPayloadInvalidErrorMessage),
    )
  })

  it("throws an error if take is not an integer greater than 0", () => {
    const invalidTakeValues = [-1, 0, 0.1, "1"]

    const pagination = async (take: unknown) =>
      await paginate({
        skip: 1,
        take: take as number,
        ...dummyPaginationPromises,
      })

    invalidTakeValues.forEach((take) =>
      expect(pagination(take)).rejects.toThrow(paginationPayloadInvalidErrorMessage),
    )
  })

  it("throws an error if take is greater than 100", () => {
    const pagination = async () =>
      await paginate({
        skip: 1,
        take: 101,
        ...dummyPaginationPromises,
      })

    expect(pagination()).rejects.toThrow(paginationPayloadInvalidErrorMessage)
  })

  it("throws an error if take is greater than takeMax", () => {
    const pagination = async () =>
      await paginate({
        skip: 1,
        take: 11,
        takeMax: 10,
        ...dummyPaginationPromises,
      })

    expect(pagination()).rejects.toThrow(paginationPayloadInvalidErrorMessage)
  })

  it("returns correct data", () => {
    const tests = [
      {
        payload: {
          skip: 1,
          take: 2,
          ...dummyPaginationPromises,
          count: () => new Promise<number>((resolve) => resolve(3)),
        },
        resolves: {
          items: [],
          nextPage: null,
          hasMore: false,
          itemsCount: 3,
        },
      },
      {
        payload: {
          skip: 1,
          take: 2,
          ...dummyPaginationPromises,
          count: () => new Promise<number>((resolve) => resolve(4)),
        },
        resolves: {
          items: [],
          nextPage: {skip: 3, take: 2},
          hasMore: true,
          itemsCount: 4,
        },
      },
    ]

    tests.forEach((test) => {
      const pagination = async () => await paginate(test.payload)

      expect(pagination()).resolves.toEqual(test.resolves)
    })
  })
})

describe("seeder", () => {
  it("seeds 1 item", async () => {
    const resolvedData = {foo: "bar"}

    const testSeeder = seeder(() => {
      return new Promise((resolve) => resolve(resolvedData))
    })

    const [item] = await testSeeder.seed()

    expect(item).toEqual(resolvedData)
  })

  it("seeds a custom amount of data", async () => {
    const resolvedData = {foo: "bar"}

    const testSeeder = seeder(() => {
      return new Promise((resolve) => resolve(resolvedData))
    })

    const items = await testSeeder.seed({
      amount: 2,
    })

    expect(items).toEqual([resolvedData, resolvedData])
  })

  it("passes options to the callback", async () => {
    const customOptions = {foo: "bar"}

    const testSeeder = seeder((_, options) => {
      return new Promise((resolve) => resolve(options))
    })

    const [item] = await testSeeder.seed({
      options: customOptions,
    })

    expect(item).toEqual(customOptions)
  })

  it("passes iteration index to the callback", async () => {
    const testSeeder = seeder((index) => {
      return new Promise((resolve) => resolve(index))
    })

    const items = await testSeeder.seed({
      amount: 3,
    })

    expect(items).toEqual([0, 1, 2])
  })
})
