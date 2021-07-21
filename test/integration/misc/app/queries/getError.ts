import delay from "delay"

export default async function getError() {
  await delay(10)
  return "should-not-succeed"
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "0kb",
    },
  },
}
