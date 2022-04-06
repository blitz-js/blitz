import getBasic from "app/queries/getBasic"

export const getServerSideProps = () => {
  return {props: {}}
}

export default function Web() {
  return (
    <div>
      <h1>Web</h1>
      <button onClick={() => getBasic("hey", {})}>GetBasic</button>
    </div>
  )
}
