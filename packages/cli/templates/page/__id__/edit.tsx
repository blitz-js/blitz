import {Head} from '@blitzjs/core'

const Edit<%= name %> = () => (
  <div className="container">
    <Head>
      <title><%= pluralName %></title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1>Place the UI for editing a <%= name %> here</h1>
    </main>
  </div>
)

export default Edit<%= name %>
