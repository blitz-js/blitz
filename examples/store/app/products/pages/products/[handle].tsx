import {Link, InferGetStaticPropsType, GetStaticPaths} from "blitz"
import {GetStaticPropsContext} from "next"
import getProduct from "app/products/queries/getProduct"
import getProducts from "app/products/queries/getProducts"

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const product = await getProduct({where: {handle: ctx.params!.handle as string}}, {} as any)
  return {
    props: {product},
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

const Page = function ({product}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!product) {
    return <div>Loading...</div>
  }
  return (
    <div>
      <h1>{product.name}</h1>
      <p className="description">{product.description}</p>
      <p className="price">Price: ${product.price}</p>

      <Link href="/products">
        <a>All Products</a>
      </Link>
    </div>
  )
}
export default Page
