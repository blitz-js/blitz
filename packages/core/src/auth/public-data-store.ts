import BadBehavior from "bad-behavior"
import {COOKIE_PUBLIC_DATA_TOKEN, LOCALSTORAGE_PREFIX} from "../constants"
import {deleteCookie, readCookie} from "../utils/cookie"
import {EmptyPublicData, PublicData} from "./auth-types"
import {parsePublicDataToken} from "./public-data-token"

class PublicDataStore {
  private eventKey = `${LOCALSTORAGE_PREFIX}publicDataUpdated`
  readonly emptyPublicData: EmptyPublicData = {userId: null}
  readonly observable = BadBehavior<PublicData | EmptyPublicData>()

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

  updateState(value?: PublicData | EmptyPublicData, opts?: {suppressEvent: boolean}) {
    // We use localStorage as a message bus between tabs.
    // Setting the current time in ms will cause other tabs to receive the `storage` event
    if (!opts?.suppressEvent) {
      // Prevent infinite loop
      try {
        localStorage.setItem(this.eventKey, Date.now().toString())
      } catch (err) {
        console.error("LocalStorage is not available", err)
      }
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
