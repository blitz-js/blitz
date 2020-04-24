import {Head} from '@blitzjs/core'

const New<%= ModelName %>Page = () => (
  <div className="container">
    <Head>
      <title>New <%= ModelName %></title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1>Place the form to create a new <%= ModelName %> here</h1>
    </main>
  </div>
)

export default New<%= ModelName %>Page
