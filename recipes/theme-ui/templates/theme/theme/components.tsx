import Prism from "@theme-ui/prism"
import React from "react"

const components = {
  pre: ({children}) => <>{children}</>,
  code: Prism,
}

export default components
