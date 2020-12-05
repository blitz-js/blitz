import {Head} from "blitz"
import {FC, ReactNode} from "react"
import {Container} from "theme-ui"

type LayoutProps = {
  title: string
  children: ReactNode
}

const Layout: FC<LayoutProps> = ({title, children}) => {
  return (
    <>
      <Head>
        <title>{title || "Blitz App"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container mx="50|100|150|200">{children}</Container>
    </>
  )
}

export default Layout
