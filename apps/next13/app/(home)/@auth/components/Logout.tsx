"use client"

import styles from "../../Home.module.css"
import logout from "@/app/auth/mutations/logout"
import {useRouter} from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()
  return (
    <>
      <button
        className={styles.button}
        onClick={async () => {
          //@ts-ignore
          await logout(null).then(() => {
            router.refresh()
          })
        }}
      >
        Logout
      </button>
    </>
  )
}