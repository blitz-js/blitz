"use client"

import {LoginForm} from "../../../auth/components/LoginForm"
import {useRouter} from "next/navigation"
import {useSearchParams} from "next/navigation"

const LoginPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  return <LoginForm onSuccess={(_user) => {}} />
}

export default LoginPage
