import delay from "delay"

export default async function getBasic() {
  await delay(500)
  return "basic-result"
}
