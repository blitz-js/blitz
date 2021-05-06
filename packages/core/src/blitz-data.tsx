import {getConfig} from "@blitzjs/config"
import htmlescape from "htmlescape"
import React from "react"
import {isClient} from "./utils"

export type BlitzRuntimeData = {
  suspenseEnabled: boolean
  sessionCookiePrefix: string
}

export function _getBlitzRuntimeData(): BlitzRuntimeData {
  const config = getConfig()
  return {
    sessionCookiePrefix: (config._meta.packageName || "blitz").replace(/[^a-zA-Z0-9-_]/g, "_"),
    suspenseEnabled: config.experimental?.reactRoot !== false,
  }
}

export function getBlitzRuntimeData() {
  if (isClient && !process.env.JEST_WORKER_ID) {
    return window.__BLITZ_DATA__
  } else {
    if (!global.__BLITZ_DATA__) {
      global.__BLITZ_DATA__ = _getBlitzRuntimeData()
    }
    return global.__BLITZ_DATA__
  }
}

// Automatically deserialize __BLITZ_DATA__ in a browser environment
if (isClient && !process.env.JEST_WORKER_ID) {
  deserializeAndSetBlitzDataOnWindow()
}

export function deserializeAndSetBlitzDataOnWindow() {
  try {
    const data: typeof window["__BLITZ_DATA__"] = JSON.parse(
      document.getElementById("__BLITZ_DATA__")!.textContent!,
    )
    window.__BLITZ_DATA__ = data
  } catch (e) {
    console.error(
      "Error deserializing __BLITZ__DATA__. Make sure you have a custom _document.js/tsx page that uses <BlitzScript/>",
      e,
    )
  }
}

export function BlitzData() {
  return (
    <script
      id="__BLITZ_DATA__"
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: htmlescape(_getBlitzRuntimeData()),
      }}
    />
  )
}
