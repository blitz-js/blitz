import Link from "next/link"
import Test from "./react-query"
import styles from "src/styles/Home.module.css"
// import { getSessionContext } from "@blitzjs/auth"
// import getCurrentUser from "../src/users/queries/getCurrentUser"
export default async function Home() {
  // const ctx = await getSessionContext()
  // console.log(ctx)
  // const user = getCurrentUser(null, ctx)
  console.log(user)
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
      </div>
      <Test />
    </div>
  )
}
