const AuthPage = () => {
  return (
    <div>
      {JSON.stringify(
        {
          message: "This is a page that requires authentication",
        },
        null,
        2,
      )}
    </div>
  )
}

AuthPage.authenticate = true

export default AuthPage
