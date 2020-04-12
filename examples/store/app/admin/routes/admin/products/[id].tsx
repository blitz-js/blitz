import {Link, useRouter, useQuery} from '@blitzjs/core'
import getProduct from 'app/products/queries/getProduct'
import ProductForm from 'app/products/components/ProductForm'

export default function() {
  const router = useRouter()
  const [product, {status, error}] = useQuery(getProduct, {where: {id: parseInt(router.query.id as string)}})

  if (status === 'loading') {
    return <div>Loading...</div>
  } else if (status === 'error') {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Edit Product</h1>
      <div>
        <ProductForm product={product} onSuccess={() => router.push('/admin/products')} />
      </div>
      <p>
        <Link href="/admin">
          <a>Store Admin</a>
        </Link>
      </p>
    </div>
  )
}
