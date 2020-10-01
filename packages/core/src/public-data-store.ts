import {
  LOCALSTORAGE_PREFIX,
  COOKIE_PUBLIC_DATA_TOKEN,
  PublicData,
  getPublicDataToken,
  parsePublicDataToken,
  deleteCookie,
} from "./supertokens"
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

  updateState() {
    // We use localStorage as a message bus between tabs.
    // Setting the current time in ms will cause other tabs to receive the `storage` event
    localStorage.setItem(this.eventKey, Date.now().toString())
    this.observable.next(this.getData())
  }

  clear() {
    deleteCookie(COOKIE_PUBLIC_DATA_TOKEN)
    queryCache.clear()
    this.updateState()
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
    return getPublicDataToken()
  }
}
export const publicDataStore = new PublicDataStore()
