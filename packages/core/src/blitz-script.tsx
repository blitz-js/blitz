import {NextScript} from "next/document"
import React from "react"
import {BlitzData} from "./blitz-data"

export function BlitzScript() {
  return (
    <>
      <BlitzData />
      <NextScript />
    </>
  )
}
