import {useMemo} from "react"
import {ssrQuery, GetServerSideProps, Link, BlitzPage, PromiseReturnType} from "blitz"
import getProducts from "app/products/queries/getProducts"
import superjson from "superjson"

type PageProps = {
  dataString: string
}

type Products = PromiseReturnType<typeof getProducts>

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  const products = await ssrQuery(getProducts, {orderBy: {id: "desc"}}, {req, res})
  const dataString = superjson.stringify(products)
  return {
    props: {
      dataString,
    },
  }
}

const Page: BlitzPage<PageProps> = function ({dataString}) {
  const {products} = useMemo(() => superjson.parse(dataString), [dataString]) as Products

  return (
    <div>
      <h1>Products</h1>
      <div id="products">
        {products.map((product) => (
          <p key={product.id}>
            <Link href="/products/[handle]" as={`/products/${product.handle}`}>
              <a>{product.name}</a>
            </Link>
            - Created At: {product.createdAt.toISOString()}
          </p>
        ))}
      </div>
    </div>
  )
}
export default Page
