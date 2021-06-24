import getBasic from '../queries/getBasic'

const Page = () => {
  console.log('DEBUG', typeof getBasic, typeof getBasic())
  return <div id="page-container">Hello World</div>
}
export default Page
