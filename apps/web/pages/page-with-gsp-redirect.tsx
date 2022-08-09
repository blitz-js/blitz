import {Routes} from "@blitzjs/next"
import {gSP} from "app/blitz-server"

export const getStaticProps = gSP<{data: {test: string}}>(async ({ctx}) => {
  return {
    redirect: {
      destination: Routes.UsersPage(),
    },
    props: {
      data: {
        test: "hello",
        date: new Date(),
      },
    },
  }
})

function PageWithGspRedirect({data}) {
  return <div>{JSON.stringify(data, null, 2)}</div>
}

export default PageWithGspRedirect
