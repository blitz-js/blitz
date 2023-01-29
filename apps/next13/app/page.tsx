import Link from "next/link"
import styles from "src/styles/Home.module.css"
import Test from "./react-query"
import {cookies, headers} from "next/headers"
import {getServerSession} from "../src/blitz-server"

export default async function Home() {
  const session = await getServerSession(cookies(), headers())
  console.log("session", session.userId)
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
          flexDirection: "row",
        }}
      >
        <Link href={"/auth/signup"} className={styles.button}>
          <strong>Sign Up</strong>
        </Link>
        <Link href={"/auth/login"} className={styles.loginButton}>
          <strong>Login</strong>
        </Link>
        <Test />
      </div>
    </div>
  )
}
