export async function getServerSideProps() {
  return {
    props: { time: new Date() },
  }
}

const Page = (props) => {
  return <p className="data">timestring: {props.time.toISOString()}</p>
}

export default Page
