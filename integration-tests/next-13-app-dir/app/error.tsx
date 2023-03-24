"use client" // Error components must be Client components

import React, {useEffect} from "react"

export default function Error({error, reset}: {error: Error; reset: () => void}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
  return (
    <div id="error">
      {error.name === "AuthenticationError" ? (
        <>Error: You are not authenticated</>
      ) : (
        <>Error: {error.message}</>
      )}
    </div>
  )
}
