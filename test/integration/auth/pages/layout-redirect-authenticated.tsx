import RedirectAuthenticatedLayout from "app/layouts/RedirectAuthenticatedLayout"
import {BlitzPage} from "blitz"

const LayoutRedirectAuthenticatedPage: BlitzPage = () => <div id="page-container">Hello World</div>

LayoutRedirectAuthenticatedPage.getLayout = (page) => (
  <RedirectAuthenticatedLayout>{page}</RedirectAuthenticatedLayout>
)

export default LayoutRedirectAuthenticatedPage
