"use client"

import {useRouter} from "next/navigation"
import SignupForm from "../components/SignupForm"

const SignUp = () => {
  const router = useRouter()
  return <SignupForm onSuccess={() => router.push("/")} />
}

export default SignUp
