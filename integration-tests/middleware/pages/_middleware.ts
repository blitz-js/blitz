import {NextResponse} from "next/server"

export function middleware() {
  const response = NextResponse.next()
  response.headers.set("global-middleware", "true")
  return response
}
