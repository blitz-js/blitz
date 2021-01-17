import {getConfig} from "@blitzjs/config"
import htmlescape from "htmlescape"
import React from "react"

// Automatically deserialize __BLITZ_DATA__ in a browser environment
if (typeof window !== "undefined") {
  if (document.getElementById("__BLITZ_DATA__")) {
    deserializeAndSetBlitzDataOnWindow()
  }
}

export function getBlitzData() {
  return {config: getConfig()}
}

export function deserializeAndSetBlitzDataOnWindow() {
  try {
    const data: typeof window["__BLITZ_DATA__"] = JSON.parse(
      document.getElementById("__BLITZ_DATA__")!.textContent!,
    )
    window.__BLITZ_DATA__ = data
  } catch (e) {
    console.error(e)
  }
}

export function BlitzData() {
  return (
    <script
      id="__BLITZ_DATA__"
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: htmlescape(getBlitzData()),
      }}
    />
  )
}
