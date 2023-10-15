"use client"
import {useRouter} from "next/navigation"
import {LoginForm} from "../components/LoginForm"
import {useSearchParams} from "next/navigation"
import { Route } from "next"

const LoginPage = () => {
  const router = useRouter()
  const next = useSearchParams()?.get("next")
  return (
    <LoginForm
      onSuccess={() => {
        // refetch data for server components
        router.refresh()
        if (next) {
          router.push(next as Route)
        } else {
          router.push("/")
        }
      }}
    />
  )
}

export default LoginPage
