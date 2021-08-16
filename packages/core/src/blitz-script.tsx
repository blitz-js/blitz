import {NextScript} from "next/document"
import React, {ComponentPropsWithoutRef} from "react"

export type BlitzScriptProps = ComponentPropsWithoutRef<typeof NextScript>

export function BlitzScript(props: BlitzScriptProps) {
  return <NextScript {...props} />
}
