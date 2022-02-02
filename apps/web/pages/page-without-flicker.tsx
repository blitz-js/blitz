const PageWithRedirect = ({data}) => {
  return <div>{JSON.stringify(data)}</div>
}

PageWithRedirect.suppressFirstRenderFlicker = true

export default PageWithRedirect
