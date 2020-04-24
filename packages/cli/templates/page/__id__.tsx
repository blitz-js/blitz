import {Head} from '@blitzjs/core'

const View<%= name %> = () => (
  <div className="container">
    <Head>
      <title><%= pluralName %></title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1>Place the detail view for a single <%= name %> here</h1>
    </main>
  </div>
)

export default View<%= name %>
