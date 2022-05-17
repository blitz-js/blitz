import {useQuery} from "@blitzjs/rpc"
import {gSSP} from "app/blitz-server"
import getUsers from "app/queries/getUsers"

export const getServerSideProps = gSSP(async ({ctx}) => {
  const {prefetchQuery} = ctx

  await prefetchQuery(getUsers, {}, {})
  return {props: {}}
})

function PageWithGssp(props) {
  const [users] = useQuery(getUsers, {})
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
