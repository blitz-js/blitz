const PageWithAuthRedirect = () => {
  return (
    <div>
      {JSON.stringify(
        {
          message:
            "This is a page that will redirect you to the Home page if you are authenticated",
        },
        null,
        2,
      )}
    </div>
  )
}

PageWithAuthRedirect.redirectAuthenticatedTo = "/"

export default PageWithAuthRedirect
