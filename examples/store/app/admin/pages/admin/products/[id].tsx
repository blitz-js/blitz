import { Suspense } from "react"
import { Link, useRouter, useQuery, useRouterParams } from "blitz"
import getProduct from "app/products/queries/getProduct"
import ProductForm from "app/products/components/ProductForm"

function Product() {
  const router = useRouter()
  const { id } = useRouterParams()
  const [product] = useQuery(getProduct, { where: { id: Number(id) } })

  return <ProductForm product={product} onSuccess={() => router.push("/admin/products")} />
}

function EditProductPage() {
  return (
    <div>
      <h1>Edit Product</h1>
      <p>
        <Link href="/admin/products">
          <a>Manage Products</a>
        </Link>
      </p>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Product />
        </Suspense>
      </div>
    </div>
  )
}

export default EditProductPage
