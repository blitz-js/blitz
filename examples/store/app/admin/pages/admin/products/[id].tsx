import {Suspense} from "react"
import {Link, useRouter, useQuery, useParam} from "blitz"
import getProduct from "app/products/queries/getProduct"
import ProductForm from "app/products/components/ProductForm"

function Product() {
  const router = useRouter()
  const id = useParam("id", "number")
  const [product] = useQuery(getProduct, {where: {id}})

  // Here to test for https://github.com/blitz-js/blitz/issues/1443
  if (!product) throw new Error("useQuery did not throw!")

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
