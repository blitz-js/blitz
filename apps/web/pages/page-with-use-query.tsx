import {SessionContext} from "@blitzjs/auth"
import {useQuery} from "@blitzjs/rpc"
import getBasic from "app/queries/getBasic"

type Props = {
  userId: unknown
  publicData: SessionContext["$publicData"]
}

const Info = () => {
  const [data] = useQuery(getBasic, {}, {suspense: false})
  return data
}

function Page(props: Props) {
  return (
    <div>
      use-query
      <Info />
    </div>
  )
}

export default Page
