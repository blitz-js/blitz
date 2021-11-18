import {BlitzLayout} from "blitz"

const AuthenticateLayout: BlitzLayout = ({children}) => {
  return <div id="layout">{children}</div>
}

AuthenticateLayout.authenticate = true

export default AuthenticateLayout
