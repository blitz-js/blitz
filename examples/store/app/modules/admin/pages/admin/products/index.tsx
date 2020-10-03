import getProducts from "app/modules/products/queries/getProducts"
import {invalidateQuery, Link, useQuery, useRouterQuery} from "blitz"
import {Suspense} from "react"
// import getProduct from "app/modules/products/queries/getProduct"

function ProductsList() {
  const {orderby = "id", order = "desc"} = useRouterQuery()

  const [{products}] = useQuery(getProducts, {
    orderBy: {
      [Array.isArray(orderby) ? orderby[0] : orderby]: order,
    },
  })

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <Link href="/admin/products/[id]" as={`/admin/products/${product.id}`}>
            <a
            // Disable until prefetch api added
            //onMouseEnter={() => getProduct({where: {id: product.id}})}
            >
              {product.name}
            </a>
          </Link>{" "}
          - Created: {product.createdAt.toISOString()}
        </li>
      ))}
    </ul>
  )
}

function AdminProducts() {
  return (
    <div>
      <h1>Products</h1>

      <button onClick={() => invalidateQuery(getProducts)}>Invalidate query</button>

      <p>
        <Link href="/admin/products/new">
          <a>Create Product</a>
        </Link>
        <Link href="/">
          <a style={{marginLeft: 16}}>Home</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <ProductsList />
      </Suspense>
    </div>
  )
}

export default AdminProducts
