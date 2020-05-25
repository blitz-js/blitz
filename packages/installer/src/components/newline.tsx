import * as React from 'react'
import {Box} from 'ink'

export function Newline({count = 1}) {
  return <Box paddingBottom={count} />
}
