import "@/app/styles/globals.css"
import {BlitzProvider} from "./blitz-client"
import {Inter} from "next/font/google"

const inter = Inter({subsets: ["latin"]})

export const metadata = {
  title: "New Blitz App",
  description: "Generated by blitz new ",
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BlitzProvider>
          <>{children}</>
        </BlitzProvider>
      </body>
    </html>
  )
}

