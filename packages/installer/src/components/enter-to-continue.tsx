import {Text} from "ink"
import * as React from "react"
import {Newline} from "./newline"

export const EnterToContinue: React.FC<{message?: string}> = ({
  message = "Press ENTER to continue",
}) => (
  <>
    <Newline />
    <Text bold>{message}</Text>
  </>
)
