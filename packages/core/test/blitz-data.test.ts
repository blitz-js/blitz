import {
  _getBlitzRuntimeData,
  BlitzData,
  deserializeAndSetBlitzDataOnWindow,
  getBlitzRuntimeData,
} from "../src/blitz-data"
import {render} from "./test-utils"

describe("BlitzData", () => {
  const renderedComponent = render(BlitzData())

  describe("BlitzData renders", () => {
    const blitzData = renderedComponent.container.querySelector(
      "#__BLITZ_DATA__",
    ) as HTMLScriptElement
    it("should be a script element", () => {
      expect(blitzData.nodeName).toEqual("SCRIPT")
    })
    it("should have type text/json", () => {
      expect(blitzData.type).toEqual("application/json")
    })
  })

  describe("BlitzData sets __BLITZ_DATA__ on window", () => {
    deserializeAndSetBlitzDataOnWindow()
    it("should equal the original data", () => {
      expect(window.__BLITZ_DATA__).toBeDefined()
      expect(window.__BLITZ_DATA__).toEqual(_getBlitzRuntimeData())
    })
  })

  describe("BlitzData sets __BLITZ_DATA__ on global", () => {
    getBlitzRuntimeData()
    it("should equal the original data", () => {
      expect(global.__BLITZ_DATA__).toBeDefined()
      expect(global.__BLITZ_DATA__).toEqual(_getBlitzRuntimeData())
    })
  })
})
