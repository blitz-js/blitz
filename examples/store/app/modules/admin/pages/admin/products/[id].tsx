import ProductForm from "app/modules/products/components/ProductForm"
import getProduct from "app/modules/products/queries/getProduct"
import {Link, useParam, useQuery, useRouter} from "blitz"
import {Suspense} from "react"

function Product() {
  const router = useRouter()
  const id = useParam("id", "number")
  const [product] = useQuery(getProduct, {where: {id}})

  return (
    <ProductForm
      product={product}
      onSuccess={async () => {
        await router.push("/admin/products")
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
