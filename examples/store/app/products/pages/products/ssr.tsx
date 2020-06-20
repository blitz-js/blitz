import {ssrQuery, GetServerSideProps, Link, BlitzPage, PromiseReturnType} from "blitz"
import getProducts from "app/products/queries/getProducts"

type PageProps = {
  products: PromiseReturnType<typeof getProducts>
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({req, res}) => {
  const products = await ssrQuery(getProducts, {orderBy: {id: "desc"}}, {req, res})

  return {
    props: {products},
  }
}

const Page: BlitzPage<PageProps> = function ({products}) {
  return (
    <div>
      <h1>Products</h1>
      <div id="products">
        {products.map((product) => (
          <p key={product.id}>
            <Link href="/products/[handle]" as={`/products/${product.handle}`}>
              <a>{product.name}</a>
            </Link>
          </p>
        ))}
      </div>
    </div>
  )
}
export default Page
