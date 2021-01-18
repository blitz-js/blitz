import {getConfig} from "@blitzjs/config"
import htmlescape from "htmlescape"
import React from "react"
import {isClient} from "./utils"

export function _getBlitzRuntimeData() {
  return {suspenseEnabled: getConfig().experimental?.reactMode !== "legacy"}
}

export function getBlitzRuntimeData() {
  if (isClient) {
    return window.__BLITZ_DATA__
  } else {
    if (!global.__BLITZ_DATA__) {
      global.__BLITZ_DATA__ = _getBlitzRuntimeData()
    }
    return global.__BLITZ_DATA__
  }
}

// Automatically deserialize __BLITZ_DATA__ in a browser environment
if (isClient) {
  if (document.getElementById("__BLITZ_DATA__")) {
    deserializeAndSetBlitzDataOnWindow()
  }
}

export function deserializeAndSetBlitzDataOnWindow() {
  try {
    const data: typeof window["__BLITZ_DATA__"] = JSON.parse(
      document.getElementById("__BLITZ_DATA__")!.textContent!,
    )
    window.__BLITZ_DATA__ = data
  } catch (e) {
    console.error("Error deserializing __BLITZ__DATA__", e)
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
