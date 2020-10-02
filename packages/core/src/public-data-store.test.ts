import {publicDataStore} from "./public-data-store"
import {COOKIE_PUBLIC_DATA_TOKEN, parsePublicDataToken} from "./supertokens"
import {deleteCookie, readCookie} from "./utils/cookie"
import {queryCache} from "react-query"
jest.mock("./supertokens", () => ({
  parsePublicDataToken: jest.fn(),
}))
jest.mock("./utils/cookie", () => ({
  readCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))
jest.mock("react-query")

describe("publicDataStore", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it("calls readCookie token on init", () => {
    // note: As public-data-store has side effects, this test might be fickle
    expect(readCookie).toHaveBeenCalledWith(COOKIE_PUBLIC_DATA_TOKEN)
  })

  describe("updateState", () => {
    let localStorageSpy: jest.SpyInstance

    beforeAll(() => {
      localStorageSpy = jest.spyOn(Storage.prototype, "setItem")
    })

    afterAll(() => {
      localStorageSpy.mockRestore()
    })
    it("sets local storage", () => {
      publicDataStore.updateState()
      expect(localStorageSpy).toBeCalledTimes(1)
    })

    it("publishes data on observable", () => {
      let ret: any = null
      publicDataStore.observable.subscribe((data) => {
        ret = data
      })
      publicDataStore.updateState()
      expect(ret).not.toEqual(null)
    })
  })

  describe("clear", () => {
    it("clears the cookie", () => {
      publicDataStore.clear()
      expect(deleteCookie).toHaveBeenCalledWith(COOKIE_PUBLIC_DATA_TOKEN)
    })
    it("clears the cache", () => {
      publicDataStore.clear()
      expect(queryCache.clear).toHaveBeenCalledTimes(1)
    })

    it("publishes empty data", () => {
      let ret: any = null
      publicDataStore.observable.subscribe((data) => {
        ret = data
      })
      publicDataStore.clear()
      expect(ret).toEqual(publicDataStore.emptyPublicData)
    })
  })

  describe("getData", () => {
    const setPublicDataToken = (value: string, expireMs?: number) => {
      ;(parsePublicDataToken as jest.MockedFunction<typeof parsePublicDataToken>).mockReturnValue({
        publicData: value as any,
        expireAt: expireMs ? new Date(expireMs) : undefined,
      })
    }

    xdescribe("when the cookie is falsy", () => {
      it("returns empty data if cookie is falsy", () => {
        const ret = publicDataStore.getData()

        expect(ret).toEqual(publicDataStore.emptyPublicData)
      })
    })

    describe("when the cookie has a value", () => {
      beforeEach(() => {
        ;(readCookie as jest.MockedFunction<typeof readCookie>).mockReturnValue("readCookie")
      })
      it("returns publicData if expireAt is empty", () => {
        setPublicDataToken("foo")
        const ret = publicDataStore.getData()

        expect(ret).toEqual("foo")
      })

      it("returns publicData if expireAt is greater or equal to than Date.now", () => {
        const dateMs = 2
        setPublicDataToken("bar", dateMs)
        const dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => dateMs - 1)
        const ret = publicDataStore.getData()

        expect(ret).toEqual("bar")
        dateNowSpy.mockRestore()
      })

      it("returns empty data if expireAt is less than Date.now", () => {
        const dateMs = 2
        setPublicDataToken("baz", dateMs)
        const dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => dateMs + 1)
        const ret = publicDataStore.getData()

        expect(ret).toEqual(publicDataStore.emptyPublicData)
        dateNowSpy.mockRestore()
      })
    })
  })
})
