import {BlitzData, deserializeAndSetBlitzDataOnWindow, getBlitzData} from "../src/blitz-data"
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

  describe("BlitzData sets __BLITZ_DATA__", () => {
    deserializeAndSetBlitzDataOnWindow()
    it("should equal the original data", () => {
      expect(window.__BLITZ_DATA__).toEqual(getBlitzData())
    })
  })
})
