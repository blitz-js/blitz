import AuthenticateLayout from "app/layouts/AuthenticateLayout"
import {BlitzPage} from "blitz"

const LayoutUnauthenticatePage: BlitzPage = () => {
  return (
    <div id="page">
      <p id="content">this should be rendered</p>
    </div>
  )
}

LayoutUnauthenticatePage.getLayout = (page) => <AuthenticateLayout>{page}</AuthenticateLayout>
LayoutUnauthenticatePage.authenticate = false

export default LayoutUnauthenticatePage
