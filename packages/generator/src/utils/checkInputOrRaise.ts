import chalk from "chalk"
import {log} from "./log"

export const checkInputsOrRaise = (inputs: string[] | string) => {
  if (typeof inputs === "string") {
    checkInputOrRaise(inputs)
  } else {
    inputs.forEach((input) => checkInputOrRaise(input))
  }
}

const checkInputOrRaise = (input: string) => {
  const regex = /^[a-zA-Z0-9-_:=\?[\]\s]+$/
  if (!regex.test(input)) {
    const firstInvalidCharacter = input.match(/[^a-zA-Z0-9-_:=\?[\]\s]/)
    if (firstInvalidCharacter) {
      log.branded(
        "Blitz Generator Parser Error: " +
          chalk.red(
            `Input contains invalid character: "${firstInvalidCharacter[0]}" in ${firstInvalidCharacter.input} at position ${firstInvalidCharacter.index}`,
          ),
      )
    }
    throw new Error(
      "Input should only contain alphanumeric characters, spaces, and the following characters: - _ : = ? [ ]",
    )
  }
}
