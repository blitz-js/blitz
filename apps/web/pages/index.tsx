import {invoke} from "@blitzjs/rpc"
import getBasic from "app/queries/getBasic"

export const getServerSideProps = () => {
  return {props: {}}
}

export default function Web() {
  return (
    <div>
      <h1>Web</h1>
      <button onClick={() => invoke(getBasic, "FROM BROWSER")}>GetBasic</button>
    </div>
  )
}
