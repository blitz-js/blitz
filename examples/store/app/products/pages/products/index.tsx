import {Link, BlitzPage, GetStaticProps} from "blitz"
import getProducts from "../../queries/getProducts"
import {Product} from "db"

type StaticProps = {
  products: Product[]
}

export const getStaticProps: GetStaticProps<StaticProps> = async () => {
  const products = await getProducts({orderBy: {id: "desc"}})

  return {
    props: {products},
    revalidate: 1,
  }
}

const Page: BlitzPage<StaticProps> = function ({products}) {
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
