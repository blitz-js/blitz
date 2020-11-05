import {Suspense} from "react"
import Layout from "app/layouts/Layout"
import {Link, usePaginatedQuery, useRouter, BlitzPage} from "blitz"
import getUsers from "app/users/queries/getUsers"

const ITEMS_PER_PAGE = 100

export const UsersList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{users, hasMore}] = usePaginatedQuery(getUsers, {
    orderBy: {id: "asc"},
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({query: {page: page - 1}})
  const goToNextPage = () => router.push({query: {page: page + 1}})

  return (
    <div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link href="/users/[userId]" as={`/users/${user.id}`}>
              <a>{user.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const UsersPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href="/users/new">
          <a>Create User</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <UsersList />
      </Suspense>
    </div>
  )
}

UsersPage.getLayout = (page) => <Layout>{page}</Layout>

export default UsersPage
