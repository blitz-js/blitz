import React  from "react"
import Layout from "app/layouts/Layout"
import {Head, BlitzPage} from "blitz"

const __ModelName__: BlitzPage = () => {
  return (
    <div>
      <Head>
        <title>__ModelName__</title>
      </Head>

      <main>
        <h1>__ModelName__</h1>
      </main>
    </div>
  )
}

__ModelName__.getLayout = (page) => <Layout title={"__ModelName__"}>{page}</Layout>

export default __ModelName__
