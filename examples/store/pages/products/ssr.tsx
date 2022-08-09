import {gSSP} from "app/blitz-server"
import Link from "next/link"
import {InferGetServerSidePropsType} from "next"
import {BlitzPage} from "@blitzjs/next"
import {invokeWithCtx} from "@blitzjs/rpc"
import getProducts from "app/products/queries/getProducts"

export const getServerSideProps = gSSP(async ({ctx}) => {
  const result = await invokeWithCtx(getProducts, {orderBy: {id: "desc"}}, ctx)
  return {
    props: {
      products: result.products,
    },
  }
})
type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const ProductsSSR: BlitzPage<PageProps> = function (props) {
  return (
    <div>
      <h1>Products</h1>
      <div id="products">
        {props.products.map((product) => {
          const createdAt = product.createdAt.toLocaleString()
          return(
          <p key={product.id}>
            <Link href="/products/[handle]" as={`/products/${product.handle}`}>
              <a>{product.name}</a>
            </Link>
            - Created At: {createdAt}
          </p>
          )
        })}
      </div>
    </div>
  )
}
export default ProductsSSR
