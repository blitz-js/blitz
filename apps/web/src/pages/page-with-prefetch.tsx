import {useQuery} from "@blitzjs/rpc"
import {gSSP} from "src/blitz-server"
import getUsers from "src/queries/getUsers"

export const getServerSideProps = gSSP(async ({ctx}) => {
  const {prefetchQuery} = ctx

  await prefetchQuery(getUsers, {}, {})
  return {props: {}}
})

function PageWithPrefetch(props) {
  const [users] = useQuery(getUsers, {})
  return (
    <div>
      {users.map((u) => (
        <div key={u.createdAt.toDateString()}>
          <p>name: {u.name}</p>
          <p>roles: {u.roles.join(", ")}</p>
          <p>email: {u.email}</p>
          <hr />
        </div>
      ))}
    </div>
  )
}

export default PageWithPrefetch
