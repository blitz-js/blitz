import {Suspense, Fragment} from "react"
import {BlitzPage, useInfiniteQuery, Link} from "blitz"
import getProducts from "app/products/queries/getProducts"

const Products = () => {
  const [
    productPages,
    {isFetching, isFetchingNextPage, fetchNextPage, hasNextPage},
  ] = useInfiniteQuery(getProducts, (page = {take: 3, skip: 0}) => page, {
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  return (
    <>
      {productPages.map((page, i) => (
        <Fragment key={i}>
          {page.products.map((product) => (
            <p key={product.id} data-test="productName">
              {product.name}
            </p>
          ))}
        </Fragment>
      ))}

      <div>
        <button onClick={() => fetchNextPage()} disabled={!hasNextPage || !!isFetchingNextPage}>
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
            ? "Load More"
            : "Nothing more to load"}
        </button>
      </div>

      <div>{isFetching && !isFetchingNextPage ? "Fetching..." : null}</div>
    </>
  )
}

const Page: BlitzPage = function () {
  return (
    <div>
      <h1>Products - Infinite</h1>
      <Link href="/products/paginated">
        <a>Go to Paginated Product List</a>
      </Link>
      <Suspense fallback={<div>Loading...</div>}>
        <Products />
      </Suspense>
    </div>
  )
}
export default Page
