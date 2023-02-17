import Link from "next/link"
import styles from "src/styles/Home.module.css"
import Test from "./react-query"
import {getAppSession, useAuthenticatedAppSession} from "../src/blitz-server"
import getCurrentUser from "../src/users/queries/getCurrentUser"

export default async function Home() {
  await useAuthenticatedAppSession({
    redirectTo: "/auth/login",
    // role: ["admin"],
    // redirectAuthenticatedTo: "/dashboard",
  })
  const ctx = await getAppSession()
  console.log("session", ctx.session.userId)
  const user = await getCurrentUser(null, ctx)
  console.log("user", user)
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Link href={"/auth/signup"} className={styles.button}>
          <strong>Sign Up</strong>
        </Link>
        <Link href={"/auth/login"} className={styles.loginButton}>
          <strong>Login</strong>
        </Link>
        <div style={{height: 20}} />
        <p>Server Session</p>
        <p>UserId: {user?.id}</p>
        <p>Email: {user?.email}</p>
        <div style={{height: 20}} />
        <p>Client Session</p>
        <Test />
      </div>
    </div>
  )
}
