const PageWithoutFlicker = ({data}) => {
  return <div>{JSON.stringify(data)}</div>
}

PageWithoutFlicker.suppressFirstRenderFlicker = true

export default PageWithoutFlicker
