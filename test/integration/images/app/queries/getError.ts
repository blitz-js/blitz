export default async function getError() {
  return "should-not-succeed"
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "0kb",
    },
  },
}
