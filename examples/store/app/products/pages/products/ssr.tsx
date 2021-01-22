import {invokeWithMiddleware, Link, BlitzPage, InferGetServerSidePropsType} from "blitz"
import getProducts from "app/products/queries/getProducts"

export const getServerSideProps = async ({req, res}) => {
  const result = await invokeWithMiddleware(getProducts, {orderBy: {id: "desc"}}, {req, res})
  return {
    props: {
      products: result.products,
    },
  }
}
type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const Page: BlitzPage<PageProps> = function (props) {
  return (
    <div>
      <h1>Products</h1>
      <div id="products">
        {props.products.map((product) => (
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
