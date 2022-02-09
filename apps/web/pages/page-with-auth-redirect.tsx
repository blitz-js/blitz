const PageWithRedirect = ({data}) => {
  return <div>{JSON.stringify(data)}</div>
}

PageWithRedirect.redirectAuthenticatedTo = "/"

export default PageWithRedirect
