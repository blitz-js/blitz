import {Suspense, Fragment} from "react"
import {BlitzPage, useInfiniteQuery, Link} from "blitz"
import getProducts from "app/products/queries/getProducts"

const Products = () => {
  const [groupedProducts, {isFetching, isFetchingMore, fetchMore, canFetchMore}] = useInfiniteQuery(
    getProducts,
    (page = {take: 3, skip: 0}) => page,
    {
      getFetchMore: (lastGroup) => lastGroup.nextPage,
    },
  )

  return (
    <>
      {groupedProducts.map((group, i) => (
        <Fragment key={i}>
          {group.products.map((product) => (
            <p key={product.id} data-test="productName">
              {product.name}
            </p>
          ))}
        </Fragment>
      ))}

      <div>
        <button onClick={() => fetchMore()} disabled={!canFetchMore || !!isFetchingMore}>
          {isFetchingMore ? "Loading more..." : canFetchMore ? "Load More" : "Nothing more to load"}
        </button>
      </div>

      <div>{isFetching && !isFetchingMore ? "Fetching..." : null}</div>
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
