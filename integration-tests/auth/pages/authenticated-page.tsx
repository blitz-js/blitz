import {useAuthorize} from "../src/client-setup"

export const getServerSideProps = () => {
  return {props: {}}
}

export default function AuthenticatedQuery() {
  useAuthorize()
  return (
    <div>
      <h1>AuthenticatedQuery</h1>
    </div>
  )
}
