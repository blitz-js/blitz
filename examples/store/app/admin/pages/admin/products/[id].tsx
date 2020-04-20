import {Suspense} from 'react'
import {Link, useRouter, useQuery} from 'blitz'
import getProduct from 'app/products/queries/getProduct'
import ProductForm from 'app/products/components/ProductForm'

function Product() {
  const router = useRouter()
  const id = parseInt(router?.query.id as string)
  const [product] = useQuery(getProduct, {where: {id}})

  return <ProductForm product={product} onSuccess={() => router.push('/admin/products')} />
}

export default function () {
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
