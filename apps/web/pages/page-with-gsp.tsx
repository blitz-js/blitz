import {gSP} from "app/blitz-server"

export const getStaticProps = async ({ctx}) => {
  return {
    props: {
      data: Array(1000).fill({something: "hey yo"}),
    },
  }
}

function PageWithGsp({data}) {
  return <div>{JSON.stringify(data, null, 2)}</div>
}

export default PageWithGsp
