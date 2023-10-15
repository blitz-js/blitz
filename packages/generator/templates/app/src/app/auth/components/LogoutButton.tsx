"use client"
import styles from "app/styles/Home.module.css"
import logout from "../mutations/logout"
import {useRouter} from "next/navigation"
import {useMutation} from "@blitzjs/rpc"

export function LogoutButton() {
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)
  return (
    <>
      <button
        className={styles.button}
        onClick={async () => {
          await logoutMutation()
          router.push("/")
        }}
      >
        Logout
      </button>
    </>
  )
}