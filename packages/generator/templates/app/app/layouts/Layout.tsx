import { Fragment } from "react"
import { Head } from "blitz"

const Layout = ({ title, children }) => (
  <Fragment>
    <Head>
      <title>{title || "__name__"}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    {children}
  </Fragment>
)

export const getLayout = <Layout>{page}</Layout>

export default Layout
