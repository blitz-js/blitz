import { Link, BlitzPage, GetServerSideProps, ssrQuery } from "@blitzjs/core"
import getProducts from "app/products/queries/getProducts"
import { Product } from "db"

type PageProps = {
  products: Product[]
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ req, res }) => {
  const products = await ssrQuery(getProducts, { orderBy: { id: "desc" } }, { req, res })

  return {
    props: { products },
  }
}

const Page: BlitzPage<PageProps> = function ({ products }) {
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
