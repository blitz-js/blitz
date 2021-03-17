import { useRouter } from 'next/router'

const Page = () => {
  const router = useRouter()
  const { query } = router
  return (
    <>
      <p id="asdf">This is {query.name}</p>
      <p id="query">{JSON.stringify(query)}</p>
    </>
  )
}

Page.getInitialProps = () => ({})

export default Page
