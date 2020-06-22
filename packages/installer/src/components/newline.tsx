import * as React from "react"
import {Box} from "ink"

export const Newline: React.FC<{count?: number}> = ({count = 1}) => {
  return <Box paddingBottom={count} />
}
