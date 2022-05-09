import {useQuery} from "@blitzjs/rpc"
import {gSSP} from "app/blitz-server"
import getUsers from "app/queries/getUsers"

export const getServerSideProps = gSSP(async ({ctx}) => {
  const {prefetchBlitzQuery} = ctx

  const {dehydratedState} = await prefetchBlitzQuery(getUsers, {})
  return {
    props: {
      dehydratedState,
    },
  }
})

function PageWithGssp() {
  const [users, {isLoading, isFetching}] = useQuery(getUsers, {})
  console.log({users, isLoading, isFetching})
  return (
    <div>
      {users.map((u) => (
        <div key={u.createdAt.toDateString()}>
          <p>name: {u.name}</p>
          <p>role: {u.role}</p>
          <p>email: {u.email}</p>
          <hr />
        </div>
      ))}
    </div>
  )
}

export default PageWithGssp
