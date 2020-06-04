import { Suspense } from "react"
import { Link, useRouter, useQuery, useParams } from "blitz"
import getProduct from "app/products/queries/getProduct"
import ProductForm from "app/products/components/ProductForm"

function Product() {
  const router = useRouter()
  const { id } = useParams()
  const [product { mutate }] = useQuery(getProduct, { where: { id: Number(id) } })

  return (
    <ProductForm
      product={product}
      onSuccess={(updatedProduct) => {
        mutate(updatedProduct)
        router.push("/admin/products")
      }}
    />
  )
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
