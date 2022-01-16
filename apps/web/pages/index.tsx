import {todo, todoServer} from "blitz"

export const getServerSideProps = () => {
  console.log(todoServer)
  return {props: {}}
}

export default function Web() {
  console.log(todo)

  return (
    <div>
      <h1>Web</h1>
    </div>
  )
}
