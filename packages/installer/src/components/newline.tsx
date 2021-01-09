import {Box} from "ink"
import * as React from "react"

export const Newline: React.FC<{count?: number}> = ({count = 1}) => {
  return <Box paddingBottom={count} />
}
