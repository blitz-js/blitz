import {Head} from '@blitzjs/core'

const Home = () => (
  <div className="container">
    <Head>
      <title>testApp</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <div className="logo">
        <img src="/logo.png" alt="blitz icon" height="72" width="72" />
      </div>
      <h1 className="title" style={{marginBottom: 24}}>
        Welcome to Blitz.js
      </h1>
      <p>
        Get started by editing this page.{' '}
        <pre>
          <code>/app/pages/index.tsx</code>
        </pre>
      </p>
      <div className="buttons">
        <a
          className="button"
          href="https://blitzjs.com?utm_source=blitz-new&utm_medium=app-template&utm_campaign=blitz-new"
          target="_blank"
          rel="noopener noreferrer">
          Documentation
        </a>
        <a
          className="button-outline"
          href="https://github.com/blitz-js/blitz"
          target="_blank"
          rel="noopener noreferrer">
          Github Repo
        </a>
      </div>
    </main>

    <footer>
      <a
        href="https://blitzjs.com?utm_source=blitz-new&utm_medium=app-template&utm_campaign=blitz-new"
        target="_blank"
        rel="noopener noreferrer">
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

      footer {
        width: 100%;
        height: 100px;
        border-top: 1px solid #eaeaea;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #45009d;
      }

      footer img {
        margin-left: 0.5rem;
      }

      footer a {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      a {
        color: #f4f4f4;
        text-decoration: none;
      }

      .title a:hover,
      .title a:focus,
      .title a:active {
        text-decoration: underline;
      }

      .title {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        color: #000000;
      }

      .title,
      .description {
        text-align: center;
      }

      .description {
        line-height: 1.5;
        font-size: 1.5rem;
      }

      .logo {
        margin-bottom: 2rem;
      }

      .logo img {
        width: 72px;
        height: 72px;
      }

      .buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 0.5rem;
        margin-top: 1rem;
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

      code {
        background: #fafafa;
        border-radius: 5px;
        padding: 0.75rem;
        font-size: 1.1rem;
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
      @import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;700&display=swap');

      html,
      body {
        padding: 0;
        margin: 0;
        font-family: 'Libre Franklin', sans-serif;
      }

      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        box-sizing: border-box;
      }
    `}</style>
  </div>
)

export default Home
