import {describe, it, expect} from "vitest"
import {paginate} from "../src/paginate"

describe("paginate", () => {
  const dummyPaginationPromises = {
    count: () => new Promise<number>((resolve) => resolve(1)),
    query: () => new Promise<object[]>((resolve) => resolve([])),
  }

  it("throws an error if skip is not a positive integer", async () => {
    const invalidSkipValues = [null, -1, 0.1, "1"]

    const pagination = async (skip: any) =>
      await paginate({
        take: 1,
        skip,
        ...dummyPaginationPromises,
      })

    for (const skip of invalidSkipValues) {
      await expect(pagination(skip)).rejects.toThrow()
    }
  })

  it("throws an error if take is not an integer greater than or equal to 0", async () => {
    const invalidTakeValues = [null, -1, 0.1, "1"]

    const pagination = async (take: any) =>
      await paginate({
        skip: 1,
        take,
        ...dummyPaginationPromises,
      })

    for (const take of invalidTakeValues) {
      await expect(pagination(take)).rejects.toThrow()
    }
  })

  it("throws an error if take is greater than 500", async () => {
    const pagination = async () =>
      await paginate({
        skip: 1,
        take: 501,
        ...dummyPaginationPromises,
      })

    await expect(pagination()).rejects.toThrow()
  })

  it("throws an error if take is greater than maxTake", async () => {
    const pagination = async () =>
      await paginate({
        skip: 1,
        take: 11,
        maxTake: 10,
        ...dummyPaginationPromises,
      })

    await expect(pagination()).rejects.toThrow()
  })

  it("returns correct data", async () => {
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

    for (const test of tests) {
      const pagination = async () => await paginate(test.payload)

      await expect(pagination()).resolves.toEqual(test.resolves)
    }
  })
})
