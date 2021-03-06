import { useRouter } from 'next/router'

export async function getStaticProps() {
  return {
    props: { time: new Date() },
  }
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

const Page = ({ time }) => {
  const { isFallback } = useRouter()

  if (isFallback) return null

  return <p>hello blocking {time.toString()}</p>
}

export default Page
