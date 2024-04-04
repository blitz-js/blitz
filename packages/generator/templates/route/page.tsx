import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { __ModelNames__List } from "./components/__ModelNames__List"

export const metadata: Metadata = {
  title: "__ModelNames__",
  description: "List of __modelNames__"
}

export default function Page() {
  return (
    <div>
      <p>
        <Link href={"/__modelNames__/new"}>Create __ModelName__</Link>
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <__ModelNames__List />
      </Suspense>
    </div>
  )
}
