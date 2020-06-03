import { Suspense } from "react"
import { useQuery, Link } from "blitz"
import getProducts from "app/products/queries/getProducts"
import getProduct from "app/products/queries/getProduct"

function ProductsList() {
  const [products] = useQuery(getProducts, { orderBy: { id: "desc" } })

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <Link href="/admin/products/[id]" as={`/admin/products/${product.id}`}>
            <a onMouseEnter={() => getProduct({ where: { id: product.id } })}>{product.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function AdminProducts() {
  return (
    <div>
      <h1>Products</h1>

      <p>
        <Link href="/admin/products/new">
          <a>Create Product</a>
        </Link>
        <Link href="/admin">
          <a style={{ marginLeft: 16 }}>Admin</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <ProductsList />
      </Suspense>
    </div>
  )
}

export default AdminProducts
