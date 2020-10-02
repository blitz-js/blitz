import {
  LOCALSTORAGE_PREFIX,
  COOKIE_PUBLIC_DATA_TOKEN,
  PublicData,
  parsePublicDataToken,
} from "./supertokens"
import {readCookie, deleteCookie} from "./utils/cookie"
import BadBehavior from "bad-behavior"
import {queryCache} from "react-query"

class PublicDataStore {
  private eventKey = `${LOCALSTORAGE_PREFIX}publicDataUpdated`
  readonly emptyPublicData: PublicData = {userId: null, roles: []}
  readonly observable = BadBehavior<PublicData>()

  constructor() {
    if (typeof window !== "undefined") {
      // Set default value
      this.updateState()
      window.addEventListener("storage", (event) => {
        if (event.key === this.eventKey) {
          this.updateState()
        }
      })
    }
  }

  updateState(value?: PublicData) {
    // We use localStorage as a message bus between tabs.
    // Setting the current time in ms will cause other tabs to receive the `storage` event
    localStorage.setItem(this.eventKey, Date.now().toString())
    this.observable.next(value ?? this.getData())
  }

  clear() {
    deleteCookie(COOKIE_PUBLIC_DATA_TOKEN)
    queryCache.clear()
    this.updateState(this.emptyPublicData)
  }

  getData() {
    const publicDataToken = this.getToken()
    if (!publicDataToken) {
      return this.emptyPublicData
    }

    const {publicData, expireAt} = parsePublicDataToken(publicDataToken)

    if (expireAt && expireAt.getTime() < Date.now()) {
      this.clear()
      return this.emptyPublicData
    }
    return publicData
  }

  private getToken() {
    return readCookie(COOKIE_PUBLIC_DATA_TOKEN)
  }
}
export const publicDataStore = new PublicDataStore()
