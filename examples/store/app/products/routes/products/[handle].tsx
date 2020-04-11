import {Link, BlitzPage, GetStaticProps, GetStaticPaths} from '@blitzjs/core'
import getProduct from 'app/products/queries/getProduct'
import getProducts from 'app/products/queries/getProducts'
import {Product} from 'prisma'

type StaticProps = {
  product: Product
}

export const getStaticProps: GetStaticProps<StaticProps> = async ctx => {
  const product = await getProduct({where: {handle: ctx.params?.handle as string}})

  return {
    props: {product},
  }
}
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (await getProducts()).map(({handle}) => ({params: {handle}}))
  return {
    paths,
    fallback: true,
  }
}

const Page: BlitzPage<StaticProps> = function({product}) {
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
