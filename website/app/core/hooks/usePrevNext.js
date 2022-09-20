import {useRouter} from "blitz"
import {useContext} from "react"

import {SidebarContext} from "@/layouts/SidebarLayout"

export function usePrevNext() {
  let router = useRouter()
  let {nav} = useContext(SidebarContext)
  let pages = nav.flatMap((category) => category.pages)
  let pageIndex = pages.findIndex((page) => page.href === router.pathname)
  return {
    prev: pageIndex > -1 ? pages[pageIndex - 1] : undefined,
    next: pageIndex > -1 ? pages[pageIndex + 1] : undefined,
  }
}
