import {Link, BlitzPage, GetStaticProps} from '@blitzjs/core'
import getProducts from 'app/products/queries/getProducts'
import {Product} from 'prisma'

type StaticProps = {
  products: Product[]
}

export const getStaticProps: GetStaticProps<StaticProps> = async () => {
  const products = await getProducts()

  return {
    props: {products},
  }
}

const Page: BlitzPage<StaticProps> = function ({products}) {
  return (
    <div>
      <h1>Products</h1>
      <div>
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
