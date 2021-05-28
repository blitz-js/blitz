import {NextScript} from "next/document"
import React, {ComponentPropsWithoutRef} from "react"
import {BlitzData} from "./blitz-data"

export type BlitzScriptProps = ComponentPropsWithoutRef<typeof NextScript>

export function BlitzScript(props: BlitzScriptProps) {
  return (
    <>
      <BlitzData />
      <NextScript {...props} />
    </>
  )
}
