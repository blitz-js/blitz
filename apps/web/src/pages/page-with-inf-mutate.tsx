import {useSuspenseInfiniteQuery} from "@blitzjs/rpc"
import {gSSP} from "src/blitz-server"
import getInfiniteUsers from "src/queries/getInfiniteUsers"
import {useActionState} from "react"

export const getServerSideProps = gSSP(async ({ctx}) => {
  const {prefetchInfiniteQuery} = ctx

  await prefetchInfiniteQuery(getInfiniteUsers, {}, {})
  return {props: {}}
})

function PageWithInfiniteQueryMutate(props) {
  const [usersPages, extraInfo] = useSuspenseInfiniteQuery(
    getInfiniteUsers,
    (page = {take: 3, skip: 0}) => page,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: {take: 3, skip: 0},
    },
  )
  const {isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, setQueryData} = extraInfo

  const onOnContactSave = async (previousState, formData: FormData) => {
    const name = formData.get("name")

    await setQueryData(
      (oldData) => {
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              users: [
                {
                  id: Math.random(),
                  name,
                  role: "user",
                  email: `${name}@yopmail.com`,
                },
                ...oldData.pages[0].users,
              ],
            },
            ...oldData.pages.slice(1),
          ],
        }
      },
      {refetch: false},
    )
  }

  const [, formAction] = useActionState(onOnContactSave, {name: ""})

  return (
    <div>
      <form action={formAction}>
        <input type="text" name="name" placeholder="User name" />
        <button type="submit">Add user</button>
      </form>
      {usersPages.map((usersPage) => (
        <>
          {usersPage?.users.map((u) => (
            <div key={u.name}>
              <p>name: {u.name}</p>
              <p>role: {u.role}</p>
              <p>email: {u.email}</p>
              <hr />
            </div>
          ))}

          {usersPage.hasMore && (
            <button onClick={() => fetchNextPage()} disabled={!hasNextPage || !!isFetchingNextPage}>
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load More"
                : "Nothing more to load"}
            </button>
          )}
        </>
      ))}
    </div>
  )
}

export default PageWithInfiniteQueryMutate
