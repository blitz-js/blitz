import {Link, BlitzPage, InferGetStaticPropsType} from "blitz"
import getProducts from "../../queries/getProducts"
import {sum} from "lodash"
import {Product} from "@prisma/client"

// regression test for #1646
import {getMeSomeQualityHumor} from "../../api"
console.log("Attention! Must read: " + getMeSomeQualityHumor())

export function averagePrice(products: Product[]) {
  const prices = products.map((p) => p.price ?? 0)
  return sum(prices) / prices.length
}

export const getStaticProps = async () => {
  const {products} = await getProducts({orderBy: {id: "desc"}})
  return {
    props: {products},
    revalidate: 1,
  }
}

const Products: BlitzPage<InferGetStaticPropsType<typeof getStaticProps>> = function ({products}) {
  return (
    <div>
      <h1>First 100 Products</h1>
      <div id="products">
        {products.map((product) => (
          <p key={product.id}>
            <Link href="/products/[handle]" as={`/products/${product.handle}`}>
              <a>{product.name}</a>
            </Link>
          </p>
        ))}
      </div>
      <p>Average price: {averagePrice(products).toFixed(1)}</p>
    </div>
  )
}
export default Products
