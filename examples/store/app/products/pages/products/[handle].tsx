import {useMemo} from "react"
import {Link, BlitzPage, GetStaticProps, GetStaticPaths} from "blitz"
import getProduct from "app/products/queries/getProduct"
import getProducts from "app/products/queries/getProducts"
import {Product} from "db"
import superjson from "superjson"

type StaticProps = {
  dataString: string
}

export const getStaticProps: GetStaticProps<StaticProps> = async (ctx) => {
  const product = await getProduct({where: {handle: ctx.params!.handle as string}})
  const dataString = superjson.stringify(product)
  return {
    props: {dataString},
    revalidate: 1,
  }
}
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (await getProducts({orderBy: {id: "desc"}})).products.map(({handle}) => ({
    params: {handle},
  }))
  return {
    paths,
    fallback: true,
  }
}

const Page: BlitzPage<StaticProps> = function ({dataString}) {
  // On initial render during the build, dataString is empty for the placeholder page
  // So in that case, set product = {}
  const product = useMemo(() => (dataString ? superjson.parse(dataString) : {}), [
    dataString,
  ]) as Product

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>

      <Link href="/products">
        <a>All Products</a>
      </Link>
    </div>
  )
}
export default Page
