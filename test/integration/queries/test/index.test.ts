/* eslint-env jest */
import {findPort, killApp, launchApp, renderViaHTTP, waitFor} from "lib/blitz-test-utils"
import webdriver from "lib/next-webdriver"
import {join} from "path"

const context: any = {}
jest.setTimeout(1000 * 60 * 5)

describe("Queries", () => {
  beforeAll(async () => {
    context.appPort = await findPort()
    context.server = await launchApp(join(__dirname, "../"), context.appPort, {
      env: {__NEXT_TEST_WITH_DEVTOOL: 1},
    })

    const prerender = ["/use-query", "/invalidate-use-query", "/invalidate-use-infinite-query"]
    await Promise.all(prerender.map((route) => renderViaHTTP(context.appPort, route)))
  })
  afterAll(() => killApp(context.server))

  describe("useQuery", () => {
    it("should render query result", async () => {
      const browser = await webdriver(context.appPort, "/use-query")
      let text = await browser.elementByCss("#page").text()
      expect(text).toMatch(/Loading/)
      await browser.waitForElementByCss("#content")
      text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/basic-result/)
      if (browser) await browser.close()
    })
  })

  describe("invalidateQuery", () => {
    it("should invalidate the query", async () => {
      const browser = await webdriver(context.appPort, "/invalidate-use-query")
      await browser.waitForElementByCss("#content")
      let text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/0/)
      await browser.elementByCss("button").click()
      waitFor(500)
      text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/1/)

      if (browser) await browser.close()
    })
  })

  describe("useInfiniteQuery", () => {
    it("should render new query result after param change", async () => {
      const browser = await webdriver(context.appPort, "/use-infinite-query")
      await browser.waitForElementByCss("#content")
      let text = await browser.elementByCss("#content").text()
      expect(JSON.parse(text)).toEqual([
        {
          items: [10, 11, 12, 13, 14],
          hasMore: true,
          nextPage: {take: 5, skip: 5},
          count: 100,
        },
      ])
      await browser.elementByCss("button").click()
      waitFor(500)
      text = await browser.elementByCss("#content").text()
      expect(JSON.parse(text)).toEqual([
        {
          items: [11, 12, 13, 14, 15],
          hasMore: true,
          nextPage: {take: 5, skip: 5},
          count: 100,
        },
      ])
      if (browser) await browser.close()
    })
  })

  describe("DehydratedState", () => {
    it("should work", async () => {
      const browser = await webdriver(context.appPort, "/dehydrated-state-use-query")
      let text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/map is Map: true/)
      if (browser) await browser.close()
    })
  })

  describe("DehydratedState with usePaginatedQuery", () => {
    it("should work", async () => {
      const browser = await webdriver(context.appPort, "/dehydrated-state-use-paginated-query")
      let text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/map is Map: true/)
      if (browser) await browser.close()
    })
  })

  describe("DehydratedState with useInfiniteQuery", () => {
    it("should work", async () => {
      const browser = await webdriver(context.appPort, "/dehydrated-state-use-infinite-query")
      await browser.waitForElementByCss("#content")
      let text = await browser.elementByCss("#content").text()
      expect(JSON.parse(text)).toEqual([
        {
          items: [10, 11, 12, 13, 14],
          hasMore: true,
          nextPage: {take: 5, skip: 5},
          count: 100,
        },
      ])
    })
  })

  describe("invalidateQuery with useInfiniteQuery", () => {
    it("should invalidate the query", async () => {
      const browser = await webdriver(context.appPort, "/invalidate-use-infinite-query")
      await browser.waitForElementByCss("#content")
      let text = await browser.elementByCss("#content").text()
      expect(JSON.parse(text)).toEqual([
        {
          counter: 1,
          items: [10, 11, 12, 13, 14],
          hasMore: true,
          nextPage: {take: 5, skip: 5},
          count: 100,
        },
      ])
      await browser.elementByCss("button").click()
      waitFor(500)
      text = await browser.elementByCss("#content").text()
      expect(JSON.parse(text)).toEqual([
        {
          counter: 2,
          items: [10, 11, 12, 13, 14],
          hasMore: true,
          nextPage: {take: 5, skip: 5},
          count: 100,
        },
      ])

      if (browser) await browser.close()
    })
  })
})
