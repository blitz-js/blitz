import {Head, Link, useSession} from "blitz"
import getUser from "app/users/queries/getUser"
import trackView from "app/users/mutations/trackView"
import Layout from "app/layouts/Layout"

const UserStuff = () => {
  const session = useSession()
  return (
    <div>
      {!session.userId && (
        <>
          <div style={{marginTop: "1rem"}}>
            <Link href="/signup">Sign Up</Link>
          </div>
          <div>
            <Link href="/login">Log In</Link>
          </div>
          <a href="/api/auth/twitter" style={{display: "block"}}>
            Login with Twitter
          </a>
          <a href="/api/auth/github" style={{display: "block"}}>
            Login with Github
          </a>
        </>
      )}
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <button
        onClick={async () => {
          try {
            const user = await getUser({where: {id: session.userId as number}})
            alert(JSON.stringify(user))
          } catch (error) {
            alert("error: " + JSON.stringify(error))
          }
        }}
      >
        Get user
      </button>
      <button
        onClick={async () => {
          try {
            await trackView()
          } catch (error) {
            alert("error: " + error)
            console.log(error)
          }
        }}
      >
        Track view
      </button>
    </div>
  )
}

const Home = () => (
  <Layout>
    <div className="container">
      <Head>
        <title>auth</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="logo">
          <img src="/logo.png" alt="blitz.js" />
        </div>

        <UserStuff />
      </main>

      <footer>
        <a
          href="https://blitzjs.com?utm_source=blitz-new&utm_medium=app-template&utm_campaign=blitz-new"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Blitz.js
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main p {
          font-size: 1.2rem;
        }

        footer {
          width: 100%;
          height: 60px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #45009d;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer a {
          color: #f4f4f4;
          text-decoration: none;
        }

        .logo {
          margin-bottom: 2rem;
        }

        .logo img {
          width: 300px;
        }

        .buttons {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-gap: 0.5rem;
          margin-top: 6rem;
        }

        a.button {
          background-color: #6700eb;
          padding: 1rem 2rem;
          color: #f4f4f4;
          text-align: center;
        }

        a.button:hover {
          background-color: #45009d;
        }

        a.button-outline {
          border: 2px solid #6700eb;
          padding: 1rem 2rem;
          color: #6700eb;
          text-align: center;
        }

        a.button-outline:hover {
          border-color: #45009d;
          color: #45009d;
        }

        pre {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
        }
        code {
          font-size: 0.9rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
            Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;700&display=swap");

        html,
        body {
          padding: 0;
          margin: 0;
          font-family: "Libre Franklin", -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  </Layout>
)

export default Home
