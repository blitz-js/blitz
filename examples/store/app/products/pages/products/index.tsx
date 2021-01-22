import {useMemo} from "react"
import {Link, BlitzPage, GetStaticProps} from "blitz"
import getProducts, {averagePrice} from "../../queries/getProducts"
import {Product} from "db"
import superjson from "superjson"

// regression test for #1646
import {getMeSomeQualityHumor} from "../../api"
console.log("Attention! Must read: " + getMeSomeQualityHumor())

type StaticProps = {
  dataString: string
}

export const getStaticProps: GetStaticProps<StaticProps> = async () => {
  const {products} = await getProducts({orderBy: {id: "desc"}})
  const dataString = superjson.stringify(products)
  return {
    props: {dataString},
    revalidate: 1,
  }
}

const Page: BlitzPage<StaticProps> = function ({dataString}) {
  const products = useMemo(() => superjson.parse<Product[]>(dataString), [dataString])
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
      <p>Average price: {averagePrice(products).toFixed(1)}</p>
    </div>
  )
}
export default Page
