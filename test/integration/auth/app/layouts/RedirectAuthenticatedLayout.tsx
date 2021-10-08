import {BlitzLayout} from "blitz"

const RedirectAuthenticatedLayout: BlitzLayout = ({children}) => {
  return <div id="layout">{children}</div>
}

RedirectAuthenticatedLayout.redirectAuthenticatedTo = "/authenticated-query"

export default RedirectAuthenticatedLayout
