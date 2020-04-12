import {useQuery, Link} from '@blitzjs/core'
import getProducts from 'app/products/queries/getProducts'

export default function() {
  const [products, {status, error}] = useQuery(getProducts)

  if (status === 'loading') {
    return <div>Loading...</div>
  } else if (status === 'error') {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Products</h1>

      <p>
        <Link href="/admin/products/new">
          <a>Create Product</a>
        </Link>
        <Link href="/admin">
          <a style={{marginLeft: 16}}>Admin</a>
        </Link>
      </p>

      <ul>
        {products.map(product => (
          <li key={product.id}>
            <Link href="/admin/products/[id]" as={`/admin/products/${product.id}`}>
              <a>{product.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
