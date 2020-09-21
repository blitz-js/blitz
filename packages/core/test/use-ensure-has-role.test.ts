import {renderHook} from "./test-utils"
import {useEnsureHasRole} from "../src/use-ensure-has-role"
import {AuthenticationError} from "../src/errors"

describe("useEnsureHasRole", () => {
  it("works without parameter", () => {
    expect(function () {
      renderHook(() => useEnsureHasRole())
    }).toThrow(new AuthenticationError(""))
  })
})
