import {useEffect, useLayoutEffect} from "react"
const isServer = typeof window === "undefined"

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
export const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect
