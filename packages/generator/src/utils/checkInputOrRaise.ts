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
    throw new Error("Input can only a-z, A-Z, 0-9, _, -, [, ], ?")
  }
}
