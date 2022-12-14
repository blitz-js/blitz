function RedirectAuthenticated() {
  return <div id="page-container">Hello World</div>
}

RedirectAuthenticated.redirectAuthenticatedTo = "/authenticated-query"

export default RedirectAuthenticated
