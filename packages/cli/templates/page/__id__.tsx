import {Head} from '@blitzjs/core'

const Show<%= ModelName %>Page = () => (
  <div className="container">
    <Head>
      <title><%= ModelName %></title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1>Place the detail view for a single <%= ModelName %> here</h1>
    </main>
  </div>
)

export default Show<%= ModelName %>Page
