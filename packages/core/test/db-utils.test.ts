import {paginate, seeder} from "../src"

describe("paginate", () => {
  const invalidSkipArgumentErrorMessage = "The skip argument is invalid"
  const invalidTakeArgumentErrorMessage = "The take argument is invalid"

  const dummyPaginationPromises = {
    count: () => new Promise<number>((resolve) => resolve(1)),
    query: () => new Promise<object[]>((resolve) => resolve([])),
  }

  it("throws an error if skip is not a positive integer", () => {
    const invalidSkipValues = [-1, 0.1, "1"]

    const pagination = async (skip: any) =>
      await paginate({
        take: 1,
        skip,
        ...dummyPaginationPromises,
      })

    invalidSkipValues.forEach((skip) =>
      expect(pagination(skip)).rejects.toThrow(invalidSkipArgumentErrorMessage),
    )
  })

  it("throws an error if take is not an integer greater than 0", () => {
    const invalidTakeValues = [-1, 0, 0.1, "1"]

    const pagination = async (take: any) =>
      await paginate({
        skip: 1,
        take,
        ...dummyPaginationPromises,
      })

    invalidTakeValues.forEach((take) =>
      expect(pagination(take)).rejects.toThrow(invalidTakeArgumentErrorMessage),
    )
  })

  it("throws an error if take is greater than 500", () => {
    const pagination = async () =>
      await paginate({
        skip: 1,
        take: 501,
        ...dummyPaginationPromises,
      })

    expect(pagination()).rejects.toThrow(invalidTakeArgumentErrorMessage)
  })

  it("throws an error if take is greater than takeMax", () => {
    const pagination = async () =>
      await paginate({
        skip: 1,
        take: 11,
        takeMax: 10,
        ...dummyPaginationPromises,
      })

    expect(pagination()).rejects.toThrow(invalidTakeArgumentErrorMessage)
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
          count: 3,
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
          count: 4,
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
