import {Routes} from "blitz"

export const getServerSideProps = () => {
  return {props: {}}
}

export default function Web() {
  console.log("Routes", Routes)
  return (
    <div>
      <h1>Web</h1>
    </div>
  )
}
