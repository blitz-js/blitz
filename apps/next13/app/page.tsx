import Link from "next/link"
import styles from "src/styles/Home.module.css"
import Test from "./react-query"
import {cookies, headers} from "next/headers"
import {getServerSession} from "../src/blitz-server"
import getCurrentUser from "../src/users/queries/getCurrentUser"
import {SessionContext} from "@blitzjs/auth"

export default async function Home() {
  const session = await getServerSession(cookies(), headers())
  console.log("session", session.userId)
  const user = await getCurrentUser(null, {session})
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
        <p>Role: {user?.role}</p>
        <p>UserId: {user?.id}</p>
        <p>Email: {user?.email}</p>
        <div style={{height: 20}} />
        <p>Client Session</p>
        <Test />
      </div>
    </div>
  )
}
