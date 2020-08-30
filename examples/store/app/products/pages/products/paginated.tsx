import {Suspense, useState} from "react"
import {Link, BlitzPage, usePaginatedQuery} from "blitz"
import getProducts from "app/products/queries/getProducts"

const ITEMS_PER_PAGE = 3

const Products = () => {
  const [page, setPage] = useState(0)
  const [{products, hasMore}] = usePaginatedQuery(getProducts, {
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

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
      <button disabled={!hasMore} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  )
}

const Page: BlitzPage = function () {
  return (
    <div>
      <h1>Products - Paginated</h1>
      <Link href="/products/infinite">
        <a>Go to Infinite Product List</a>
      </Link>
      <Suspense fallback={<div>Loading...</div>}>
        <Products />
      </Suspense>
    </div>
  )
}
export default Page
