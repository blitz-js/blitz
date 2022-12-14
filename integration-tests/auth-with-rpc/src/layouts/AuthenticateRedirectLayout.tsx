import {BlitzLayout} from "@blitzjs/next"

const AuthenticateRedirectLayout: BlitzLayout = ({children}) => {
  return <div id="layout">{children}</div>
}

AuthenticateRedirectLayout.authenticate = {redirectTo: "/login"}

export default AuthenticateRedirectLayout
