import {Head} from '@blitzjs/core'

const New<%= name  %> = () => (
  <div className="container">
    <Head>
      <title><%= name %></title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1>Place the form to create a new <%= name %> here</h1>
    </main>
  </div>
)

export default New<%= name %>
