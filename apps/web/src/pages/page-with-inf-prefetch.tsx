import {useInfiniteQuery} from "@blitzjs/rpc"
import {gSSP} from "src/blitz-server"
import getInfiniteUsers from "src/queries/getInfiniteUsers"

export const getServerSideProps = gSSP(async ({ctx}) => {
  const {prefetchInfiniteQuery} = ctx

  await prefetchInfiniteQuery(getInfiniteUsers, {}, {})
  return {props: {}}
})

function PageWithPrefetchInfiniteQuery(props) {
  const [usersPages] = useInfiniteQuery(getInfiniteUsers, (page = {take: 3, skip: 0}) => page, {
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
  return (
    <div>
      {usersPages.map((usersPage) =>
        usersPage?.users.map((u) => (
          <div key={u.createdAt.toDateString()}>
            <p>name: {u.name}</p>
            <p>role: {u.role}</p>
            <p>email: {u.email}</p>
            <hr />
          </div>
        )),
      )}
    </div>
  )
}

export default PageWithPrefetchInfiniteQuery
