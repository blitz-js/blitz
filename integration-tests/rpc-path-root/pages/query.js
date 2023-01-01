import getBasic from "../app/queries/getBasic"

const Page = () => {
  getBasic().then(console.log)
  return <div id="page-container">Hello World</div>
}
export default Page
