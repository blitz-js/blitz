import {publicDataStore} from "./public-data-store"
import {getPublicDataToken} from "./supertokens"

jest.mock("./supertokens", () => ({
  getPublicDataToken: jest.fn(),
}))
describe("publicDataStore", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it("calls getPublicData token on init", () => {
    // note: As public-data-store has side effects, this test might be fickle
    console.log(publicDataStore)
    expect(getPublicDataToken).toHaveBeenCalledTimes(1)
  })

  it("calls getPublicData token on init", () => {
    // note: As public-data-store has side effects, this test might be fickle
    console.log(publicDataStore)
    expect(getPublicDataToken).toHaveBeenCalledTimes(1)
  })
})
