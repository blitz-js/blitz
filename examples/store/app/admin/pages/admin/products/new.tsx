import {Link, useRouter} from '@blitzjs/core'
import ProductForm from 'app/products/components/ProductForm'

export default function() {
  const router = useRouter()
  return (
    <div>
      <h1>Create a New Product</h1>
      <div>
        <ProductForm onSuccess={() => router.push('/admin/products')} />
      </div>
      <p>
        <Link href="/admin">
          <a>Store Admin</a>
        </Link>
      </p>
    </div>
  )
}
