import ProductForm from "app/modules/products/components/ProductForm"
import {Link, useRouter} from "blitz"

function AdminNewProductPage() {
  const router = useRouter()
  return (
    <div>
      <h1>Create a New Product</h1>
      <p>
        <Link href="/admin/products">
          <a>Manage Products</a>
        </Link>
      </p>
      <div>
        <ProductForm onSuccess={() => router.push("/admin/products")} />
      </div>
    </div>
  )
}

export default AdminNewProductPage
