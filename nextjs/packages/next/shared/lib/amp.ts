import React from 'react'
import { AmpStateContext } from './amp-context'

export function isInAmpMode({
  ampFirst = false,
  hybrid = false,
  hasQuery = false,
} = {}): boolean {
  return ampFirst || (hybrid && hasQuery)
}

export function useAmp(): boolean {
  // Don't assign the context value to a variable to save bytes
  return isInAmpMode(React.useContext(AmpStateContext))
}
