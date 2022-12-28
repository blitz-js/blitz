import {BlitzLayout} from "@blitzjs/next"

const AuthenticateLayout: BlitzLayout = ({children}) => {
  return <div id="layout">{children}</div>
}

AuthenticateLayout.authenticate = true

export default AuthenticateLayout
