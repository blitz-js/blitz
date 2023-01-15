import React from "react"
import {gSP} from "app/blitz-server"
import {useMutation} from "@blitzjs/rpc"
import revalidateFn from "app/mutations/revalidate"

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
  const [prefetch, {isLoading}] = useMutation(revalidateFn)

  return (
    <div>
      <button onClick={() => prefetch()} disabled={isLoading}>
        Revalidate GSP data
      </button>
      <br />

      {JSON.stringify(data, null, 2)}
    </div>
  )
}

export default PageWithGsp
