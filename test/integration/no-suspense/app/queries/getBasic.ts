import delay from "delay"

export default async function getBasic() {
  await delay(100)
  return "basic-result"
}
