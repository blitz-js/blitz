import {BrowserInterface} from "./browsers/base"
export declare const USE_SELENIUM: boolean
/**
 *
 * @param appPortOrUrl can either be the port or the full URL
 * @param url the path/query to append when using appPort
 * @param options.waitHydration whether to wait for react hydration to finish
 * @param options.retryWaitHydration allow retrying hydration wait if reload occurs
 * @param options.disableCache disable cache for page load
 * @param options.beforePageLoad the callback receiving page instance before loading page
 * @returns thenable browser instance
 */
export default function webdriver(
  appPortOrUrl: string | number,
  url: string,
  options?: {
    waitHydration?: boolean
    retryWaitHydration?: boolean
    disableCache?: boolean
    beforePageLoad?: (page: any) => void
    locale?: string
  },
): Promise<BrowserInterface>
//# sourceMappingURL=next-webdriver.d.ts.map
