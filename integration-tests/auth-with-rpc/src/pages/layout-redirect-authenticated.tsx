import {BlitzPage} from "@blitzjs/next"
import RedirectAuthenticatedLayout from "../layouts/RedirectAuthenticatedLayout"

const LayoutRedirectAuthenticatedPage: BlitzPage = () => <div id="page-container">Hello World</div>

LayoutRedirectAuthenticatedPage.getLayout = (page) => (
  <RedirectAuthenticatedLayout>{page}</RedirectAuthenticatedLayout>
)

export default LayoutRedirectAuthenticatedPage
