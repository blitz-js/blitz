import {Suspense} from "react"
import {Link, useRouter, useQuery, useParam} from "blitz"
import {useRouter as useNextRouter} from "next/router"
import getProduct from "app/products/queries/getProduct"
import ProductForm from "app/products/components/ProductForm"

function Product() {
  const router = useRouter()
  const nextRouter = useNextRouter()
  const id = useParam("id", "number")
  console.log("id", id)
  console.log("bRouter", router.params)
  console.log("nRouter", nextRouter.query)
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
