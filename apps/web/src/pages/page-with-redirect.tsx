const PageWithRedirect = () => {
  return (
    <div>
      {JSON.stringify(
        {
          message:
            "This page requires authentication. It will redirect you to the Home page if you are NOT authenticated",
        },
        null,
        2,
      )}
    </div>
  )
}

PageWithRedirect.authenticate = {redirectTo: "/"}

export default PageWithRedirect
