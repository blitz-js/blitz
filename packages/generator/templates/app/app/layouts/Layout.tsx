import { Head } from "blitz"

const Layout = ({ title, children }) => (
  <>
    <Head>
      <title>{title || "__name__"}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    {children}
  </>
)

export default Layout
