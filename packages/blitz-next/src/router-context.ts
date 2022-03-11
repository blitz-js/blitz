import React from "react"
import {NextRouter} from "next/router"

export const RouterContext = React.createContext<NextRouter>(null as any)

if (process.env.NODE_ENV !== "production") {
  RouterContext.displayName = "RouterContext"
}
