import { Suspense } from "react"
import Link from "next/link"
import Layout from "src/core/layouts/Layout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import logout from "src/auth/mutations/logout"
import { useMutation } from "@blitzjs/rpc"
import { Routes, BlitzPage } from "@blitzjs/next"
import styles from 'src/styles/Home.module.css'

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <>
        <button
          className={styles.button}
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
          <br />
          User role: <code>{currentUser.role}</code>
        </div>
      </>
    )
  } else {
    return (
      <>
        <Link href={Routes.SignupPage()} className={styles.button}>
          <strong>Sign Up</strong>
        </Link>
        <Link href={Routes.LoginPage()} className={styles.loginButton}>
          <strong>Login</strong>
        </Link>
      </>
    )
  }
}

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <div className={styles.globe} />

      <div className={styles.container}>
        <div className={styles.toastContainer}>
          <p>
            <strong>Congrats!</strong> Your app is ready, including user sign-up and log-in.
          </p>
        </div>

        <main className={styles.main}>

          <div className={styles.wrapper}>
            <div className={styles.header}>

                  <div className={styles.logo}>
                    <svg viewBox="0 0 165 66"><path d="M104.292 56.033C104.292 56.408 104.206 56.6636 104.036 56.8C103.9 56.9363 103.627 57.0045 103.218 57.0045H99.7409C99.4001 57.0045 99.1615 56.9533 99.0251 56.8511C98.8888 56.7147 98.8206 56.4932 98.8206 56.1864L98.9229 19.8324C98.9229 19.3211 99.1444 19.0654 99.5876 19.0654H103.627C103.839 19.0654 104.292 19.0672 104.292 19.0672V19.8324V56.033ZM64.3531 57.0081C64.1145 57.0081 63.927 56.9399 63.7906 56.8035C63.6543 56.6672 63.5861 56.4968 63.5861 56.2922V19.9383C63.5861 19.3588 63.8588 19.069 64.4042 19.069H76.829C81.533 19.069 85.1463 19.9212 87.6687 21.6256C90.1912 23.2958 91.4524 25.7331 91.4524 28.9373C91.4524 30.9484 90.924 32.6528 89.8673 34.0504C88.8106 35.4138 87.1063 36.5217 84.7543 37.3739C84.6179 37.4079 84.5497 37.4932 84.5497 37.6295C84.5497 37.7318 84.6179 37.7999 84.7543 37.834C87.2767 38.5158 89.1686 39.5895 90.4298 41.0553C91.7251 42.521 92.3727 44.4469 92.3727 46.833C92.3727 50.2418 91.0945 52.7983 88.5379 54.5027C85.9814 56.1729 82.2318 57.0081 77.2892 57.0081H64.3531ZM77.5448 35.5843C79.6923 35.5843 81.516 35.1071 83.0158 34.1526C84.5157 33.1982 85.2656 31.6983 85.2656 29.6531C85.2656 27.6079 84.5157 26.0569 83.0158 25.0002C81.5501 23.9435 79.5219 23.4151 76.9313 23.4151H70.5399C70.0286 23.4151 69.7729 23.6367 69.7729 24.0798V34.8684C69.7729 35.3457 69.9604 35.5843 70.3354 35.5843H77.5448ZM77.0335 52.662C82.9647 52.662 85.9303 50.5997 85.9303 46.4751C85.9303 44.3276 85.1633 42.7255 83.6294 41.6688C82.0955 40.6121 80.0673 40.0838 77.5448 40.0838H70.591C70.2843 40.0838 70.0627 40.1349 69.9263 40.2372C69.8241 40.3394 69.7729 40.5099 69.7729 40.7485V51.895C69.7729 52.4063 69.9604 52.662 70.3354 52.662H77.0335ZM142.707 56.8624C142.81 56.9647 142.997 57.0158 143.27 57.0158H163.876C164.387 57.0158 164.643 56.7772 164.643 56.3V53.948V53.3344H163.978H149.866C149.593 53.3344 149.457 53.2492 149.457 53.0788C149.457 52.9765 149.508 52.8572 149.61 52.7208L163.876 33.8536C164.251 33.2741 164.438 32.7628 164.438 32.3197V30.479V29.9144C164.438 29.9144 164.051 29.9165 163.876 29.9165H144.241C143.866 29.9165 143.679 30.121 143.679 30.5301V32.831C143.679 33.1037 143.713 33.2911 143.781 33.3934C143.883 33.4957 144.071 33.5468 144.344 33.5468H157.075C157.382 33.5468 157.535 33.632 157.535 33.8025L157.382 34.1092L143.219 52.9765C142.946 53.3515 142.759 53.6412 142.656 53.8457C142.588 54.0502 142.554 54.3059 142.554 54.6127V56.3C142.554 56.5727 142.605 56.7602 142.707 56.8624ZM116.929 19.0676H111.51V27.7684C114.503 27.7684 116.929 25.3419 116.929 22.3486V19.0676ZM116.926 56.0308C116.926 56.4058 116.841 56.6614 116.67 56.7978C116.534 56.9341 116.278 57.0023 115.903 57.0023H112.427C112.086 57.0023 111.847 56.9512 111.711 56.8489C111.574 56.7126 111.506 56.491 111.506 56.1842V30.6699C111.506 30.3972 111.557 30.2098 111.66 30.1075C111.762 29.9712 111.949 29.903 112.222 29.903H117.028L116.926 56.0308ZM132.183 34.3137C132.183 33.9728 132.336 33.8024 132.643 33.8024H138.779C139.256 33.8024 139.495 33.5979 139.495 33.1888V30.4789V29.9165H138.881H132.745C132.439 29.9165 132.285 29.7631 132.285 29.4563V21.531V20.713L131.621 20.7129H128.093C127.752 20.7129 127.547 20.9515 127.479 21.4288L126.865 29.4563C126.865 29.7631 126.729 29.9165 126.456 29.9165H122.366C121.957 29.9165 121.752 30.1039 121.752 30.4789V33.1888C121.752 33.5979 121.974 33.8024 122.417 33.8024H126.252C126.593 33.8024 126.763 34.0069 126.763 34.416V50.6244C126.763 52.806 127.309 54.4252 128.399 55.4819C129.49 56.5045 131.16 57.0158 133.41 57.0158C135.796 57.0158 137.535 56.9306 138.625 56.7601C139.137 56.6579 139.392 56.3681 139.392 55.8909V53.6923V53.0787H138.779H135.507C134.348 53.0787 133.495 52.806 132.95 52.2606C132.439 51.7152 132.183 50.7267 132.183 49.295V34.3137Z"></path><path d="M0.241243 33.2639H10.9742C15.0585 33.2639 18.9054 35.1835 21.3612 38.4471L31.9483 52.5165C32.1484 52.7824 32.1786 53.1393 32.026 53.435L25.9232 65.2592C25.6304 65.8265 24.8455 65.8932 24.4612 65.3835L0.241243 33.2639Z"></path><path d="M42.4727 33.2822H31.7398C27.6555 33.2822 23.8086 31.3626 21.3528 28.0991L10.7656 14.0297C10.5656 13.7638 10.5354 13.4068 10.688 13.1111L16.7908 1.28696C17.0836 0.719654 17.8684 0.652924 18.2528 1.16266L42.4727 33.2822Z"></path></svg>
                  </div>

                  <h1>Your database & authentication is ready. Try it by signing up.</h1>

                  {/* Auth */}

                  <div className={styles.buttonContainer}>
                    <Suspense fallback="Loading...">
                      <UserInfo />
                    </Suspense>
                  </div>


            </div>

            <div className={styles.body}>
              {/* Instructions */}
              <div className={styles.instructions}>
                <p>
                  <strong>
                    Add a new model by running the following in your terminal:
                  </strong>
                </p>

                <div>
                  <div className={styles.code}>
                    <span>1</span>
                    <pre>
                      <code>blitz generate all project</code>
                    </pre>
                  </div>

                  <div className={styles.code}>
                    <span>2</span>
                    <pre>
                      <code>Ctrl + c</code>
                    </pre>
                  </div>

                  <div className={styles.code}>
                    <span>3</span>
                    <pre>
                      <code>blitz dev</code>
                    </pre>
                  </div>

                  <div className={styles.code}>
                    <span>4</span>
                    <pre>
                      <code>Go to{" "}
                    <Link href="/projects" className={styles.textLink}>
                      /projects
                    </Link></code>
                    </pre>
                  </div>

                </div>
              </div>
              {/* Links */}
              <div className={styles.linkGrid}>
                <a
                  href="https://blitzjs.com/docs/getting-started?utm_source=blitz-new&utm_medium=app-template&utm_campaign=blitz-new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  Blitz Docs
                  <span className={styles.arrowIcon} />
                </a>
                <a
                  href="https://nextjs.org/docs/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  Next.js Docs
                  <span className={styles.arrowIcon} />
                </a>
                <a
                  href="https://github.com/blitz-js/blitz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  Github Repo
                  <span className={styles.arrowIcon} />
                </a>
                <a
                  href="https://twitter.com/blitz_js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  Blitz Twitter
                  <span className={styles.arrowIcon} />
                </a>
                <a
                  href="https://discord.blitzjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  Discord Community
                  <span className={styles.arrowIcon} />
                </a>
              </div>

            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <span>Powered by</span>
          <a
            href="https://blitzjs.com?utm_source=blitz-new&utm_medium=app-template&utm_campaign=blitz-new"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            Blitz.js
          </a>
        </footer>
      </div>
    </Layout>
  )
}

export default Home
