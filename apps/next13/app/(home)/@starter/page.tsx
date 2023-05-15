import Link from "next/link"
import styles from "../Home.module.css"

export default async function StarterHomePage() {
  return (
    <>
      <Link href="/auth/signup" className={styles.button}>
        <strong>Sign Up</strong>
      </Link>
      <Link href="/auth/login" className={styles.loginButton}>
        <strong>Login</strong>
      </Link>
    </>
  )
}
