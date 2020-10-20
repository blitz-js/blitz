import {Suspense, useState} from "react"
import {useQuery, Link, useRouterQuery, invalidateQuery, setQueryData} from "blitz"
import getProducts from "app/products/queries/getProducts"
// import getProduct from "app/products/queries/getProduct"

function reversedProductList(productsList) {
  return {...productsList, products: [...productsList.products].reverse()}
}

function ProductsList() {
  const {orderby = "id", order = "desc"} = useRouterQuery()
  const [refetch, setRefetch] = useState(false)
  const params = {
    orderBy: {
      [Array.isArray(orderby) ? orderby[0] : orderby]: order,
    },
  }

  const [{products}] = useQuery(getProducts, params)

  return (
    <>
      <button onClick={() => setQueryData(getProducts, params, reversedProductList, {refetch})}>
        Reverse
      </button>
      <label>
        <input
          name="refetch"
          type="checkbox"
          checked={refetch}
          onChange={(event) => setRefetch(event.target.checked)}
        />
        Refetch
      </label>

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
    </>
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
