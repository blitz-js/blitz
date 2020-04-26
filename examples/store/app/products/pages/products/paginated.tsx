import {Suspense, useState} from 'react'
import {Link, BlitzPage, useQuery} from 'blitz'
import getProducts from 'app/products/queries/getProducts'

const ITEMS_PER_PAGE = 3

const Products = () => {
  const [page, setPage] = useState(0)
  const [products] = useQuery(
    getProducts,
    {
      skip: ITEMS_PER_PAGE * page,
      first: ITEMS_PER_PAGE,
    },
    {paginated: true},
  )

  return (
    <div>
      {products.map((product) => (
        <p key={product.id}>
          <Link href="/products/[handle]" as={`/products/${product.handle}`}>
            <a>{product.name}</a>
          </Link>
        </p>
      ))}
      <button disabled={page === 0} onClick={() => setPage(page - 1)}>
        Previous
      </button>
      <button disabled={products.length !== ITEMS_PER_PAGE} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  )
}

const Page: BlitzPage = function () {
  return (
    <div>
      <h1>Products - Paginated</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Products />
      </Suspense>
    </div>
  )
}
export default Page
