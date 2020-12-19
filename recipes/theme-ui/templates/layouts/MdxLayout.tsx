import {Head} from "blitz"
import {FC, ReactNode} from "react"
import {Container} from "theme-ui"

type MdxLayoutProps = {
  title: string
  children: ReactNode
}

const MdxLayout: FC<MdxLayoutProps> = ({title, children}) => {
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

export default MdxLayout
