import {Suspense} from "react"
import {Link, BlitzPage, useQuery, useRouter} from "blitz"
import getProducts from "app/products/queries/getProducts"

const ITEMS_PER_PAGE = 3

const Products = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [data, {isPreviousData}] = useQuery(
    getProducts,
    {
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    },
    {keepPreviousData: true},
  )

  const goToPreviousPage = () => router.push({query: {page: page - 1}})

  const goToNextPage = () => {
    if (!isPreviousData && data.hasMore) {
      router.push({query: {page: page + 1}})
    }
  }

  return (
    <div>
      {data.products.map((product) => (
        <p key={product.id}>
          <Link href="/products/[handle]" as={`/products/${product.handle}`}>
            <a>{product.name}</a>
          </Link>
        </p>
      ))}
      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={isPreviousData || !data.hasMore} onClick={goToNextPage}>
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
