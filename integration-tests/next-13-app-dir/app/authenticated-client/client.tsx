"use client"
import {useAuthorize} from "@blitzjs/auth"

export default function Client() {
  useAuthorize()
  return (
    <div>
      <h1>AuthenticatedQuery</h1>
    </div>
  )
}
