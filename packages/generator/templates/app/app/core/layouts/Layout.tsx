import Head from "next/head"
import { FC } from "react"

const Layout: FC<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "__name__"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {children}
    </>
  )
}

export default Layout
