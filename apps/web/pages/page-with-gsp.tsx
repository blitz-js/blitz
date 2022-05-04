import {gSP} from "app/blitz-server"

export const getStaticProps = gSP<{data: {test: string}}>(async ({ctx}) => {
  return {
    props: {
      data: {
        test: "hello",
        date: new Date(),
      },
    },
  }
})

function PageWithGsp({data}) {
  return <div>{JSON.stringify(data, null, 2)}</div>
}

export default PageWithGsp
