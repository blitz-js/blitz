import BadBehavior from "bad-behavior"
import {COOKIE_PUBLIC_DATA_TOKEN, LOCALSTORAGE_PREFIX} from "./constants"
import {PublicData} from "./types"
import {deleteCookie, readCookie} from "./utils/cookie"
import {parsePublicDataToken} from "./utils/tokens"

class PublicDataStore {
  private eventKey = `${LOCALSTORAGE_PREFIX}publicDataUpdated`
  readonly emptyPublicData: PublicData = {userId: null, roles: []}
  readonly observable = BadBehavior<PublicData>()

  constructor() {
    if (typeof window !== "undefined") {
      // Set default value & prevent infinite loop
      this.updateState(undefined, {suppressEvent: true})
      window.addEventListener("storage", (event) => {
        if (event.key === this.eventKey) {
          // Prevent infinite loop
          this.updateState(undefined, {suppressEvent: true})
        }
      })
    }
  }

  updateState(value?: PublicData, opts?: {suppressEvent: boolean}) {
    // We use localStorage as a message bus between tabs.
    // Setting the current time in ms will cause other tabs to receive the `storage` event
    if (!opts?.suppressEvent) {
      // Prevent infinite loop
      localStorage.setItem(this.eventKey, Date.now().toString())
    }
    this.observable.next(value ?? this.getData())
  }

  clear() {
    deleteCookie(COOKIE_PUBLIC_DATA_TOKEN())
    this.updateState(this.emptyPublicData)
  }

  getData() {
    const publicDataToken = this.getToken()
    if (!publicDataToken) {
      return this.emptyPublicData
    }

    const {publicData} = parsePublicDataToken(publicDataToken)
    return publicData
  }

  private getToken() {
    return readCookie(COOKIE_PUBLIC_DATA_TOKEN())
  }
}
export const publicDataStore = new PublicDataStore()
